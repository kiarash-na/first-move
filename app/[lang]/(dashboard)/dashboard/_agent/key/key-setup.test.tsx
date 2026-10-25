import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { KEYS } from "@/lib/assistant/keys/registry"
import type { Provider } from "@/lib/assistant/providers/types"
import { forgetKey, listVault } from "@/lib/assistant/vault/vault"
import { interpolate } from "@/lib/i18n/interpolate"
import { assistantCopy, renderAgent } from "../test-utils/render"
import { KeySetup } from "./key-setup"

const copy = assistantCopy()
const OPENROUTER_KEY = `sk-or-v1-${"3f".repeat(32)}`
const GATEWAY_KEY = "vck_test_key_1234567890abcdef7a1c"

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })
let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn()
  vi.stubGlobal("fetch", fetchMock)
})

afterEach(async () => {
  vi.unstubAllGlobals()
  KEYS.gateway.clear()
  KEYS.openrouter.clear()
  await forgetKey("gateway")
  await forgetKey("openrouter")
})

function setup(provider: Provider = "openrouter") {
  const onConnected = vi.fn()
  const onVaultChange = vi.fn()
  const onProvider = vi.fn()
  renderAgent(<KeySetup provider={provider} onProvider={onProvider} onConnected={onConnected} onVaultChange={onVaultChange} />)
  const field = screen.getByLabelText(copy.setup.key.label) as HTMLInputElement
  const button = screen.getByRole("button", { name: copy.setup.use })
  const ack = screen.getByRole("checkbox", { name: copy.notice.ack })
  return { onConnected, onVaultChange, onProvider, field, button, ack }
}

describe("KeySetup", () => {
  it("shows the spending-limit and expiry notice of the chosen provider, and needs its checkbox first", async () => {
    const { field, button, ack } = setup("openrouter")
    const notice = screen.getByRole("region", { name: copy.notice.title })
    expect(notice).toHaveTextContent(copy.notice.openrouter.limit)
    expect(notice).toHaveTextContent(copy.notice.openrouter.expiry)
    expect(screen.getByRole("link", { name: copy.notice.openrouter.docs })).toHaveAttribute("href", copy.notice.openrouter.docsUrl)
    expect(ack).toBeRequired()
    expect(ack).not.toBeChecked()
    expect(screen.getByText(copy.notice.required)).toBeInTheDocument()
    expect(button).toBeDisabled()

    await userEvent.type(field, OPENROUTER_KEY)
    await userEvent.type(field, "{Enter}")
    expect(fetchMock).not.toHaveBeenCalled()
    expect(KEYS.openrouter.read()).toBeNull()

    await userEvent.click(ack)
    expect(button).toBeEnabled()
    expect(screen.queryByText(copy.notice.required)).not.toBeInTheDocument()
  })

  it("phrases the notice for the AI Gateway after its docs", () => {
    setup("gateway")
    const notice = screen.getByRole("region", { name: copy.notice.title })
    expect(notice).toHaveTextContent(copy.notice.gateway.limit)
    expect(notice).toHaveTextContent(copy.notice.gateway.expiry)
    expect(screen.getByRole("link", { name: copy.notice.gateway.docs })).toHaveAttribute("href", copy.notice.gateway.docsUrl)
  })

  it("rejects what cannot be a key of the provider without sending it anywhere", async () => {
    const { field, button, ack, onConnected } = setup("openrouter")
    await userEvent.click(ack)
    await userEvent.type(field, "sk-ant-not-an-openrouter-key-000000")
    await userEvent.click(button)
    expect(screen.getByRole("status")).toHaveTextContent(copy.setup.key.invalid)
    expect(field).toHaveAttribute("aria-invalid", "true")
    expect(fetchMock).not.toHaveBeenCalled()
    expect(onConnected).not.toHaveBeenCalled()
  })

  it("checks an OpenRouter key, keeps it in memory only and empties the field", async () => {
    fetchMock.mockResolvedValue(json({ data: { label: "sk-or-v1-3f3…", limit: 10, limit_remaining: 9.5, limit_reset: "monthly", usage: 0.5, expires_at: "2026-12-31T00:00:00Z" } }))
    const { field, button, ack, onConnected } = setup("openrouter")
    expect(field).toHaveAttribute("type", "password")
    expect(field).toHaveAttribute("autocomplete", "off")
    expect(field).not.toHaveAttribute("name")
    await userEvent.click(ack)
    await userEvent.type(field, OPENROUTER_KEY)
    await userEvent.click(button)
    await waitFor(() => expect(onConnected).toHaveBeenCalledOnce())
    expect(field.value).toBe("")
    expect(KEYS.openrouter.read()).toBe(OPENROUTER_KEY)
    expect(onConnected).toHaveBeenCalledWith({
      check: { provider: "openrouter", info: { limit: 10, limitRemaining: 9.5, limitReset: "monthly", usage: 0.5, expiresAt: "2026-12-31T00:00:00Z" } },
      failure: null,
      remembered: null,
    })
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe("https://openrouter.ai/api/v1/key")
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${OPENROUTER_KEY}`)
    expect(await listVault()).toEqual([])
  })

  it("checks a Gateway key with the credits endpoint and puts it where the AI Plan Score reads it", async () => {
    fetchMock.mockResolvedValue(json({ balance: "12.50", total_used: "0.50" }))
    const { field, button, ack, onConnected } = setup("gateway")
    await userEvent.click(ack)
    await userEvent.type(field, GATEWAY_KEY)
    await userEvent.click(button)
    await waitFor(() => expect(onConnected).toHaveBeenCalledWith({ check: { provider: "gateway", balance: 12.5 }, failure: null, remembered: null }))
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://ai-gateway.vercel.sh/v1/credits")
    expect(KEYS.gateway.read()).toBe(GATEWAY_KEY)
  })

  it("never keeps a key the provider refuses", async () => {
    fetchMock.mockResolvedValue(json({ error: { code: 401, message: "User not found." } }, 401))
    const { field, button, ack, onConnected } = setup("openrouter")
    await userEvent.click(ack)
    await userEvent.type(field, OPENROUTER_KEY)
    await userEvent.click(button)
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(interpolate(copy.setup.rejected, { reason: copy.errors.key })))
    expect(KEYS.openrouter.read()).toBeNull()
    expect(onConnected).not.toHaveBeenCalled()
  })

  it("keeps the key when only the check failed on the way, and says why", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"))
    const { field, button, ack, onConnected } = setup("openrouter")
    await userEvent.click(ack)
    await userEvent.type(field, OPENROUTER_KEY)
    await userEvent.click(button)
    await waitFor(() => expect(onConnected).toHaveBeenCalledWith({ check: null, failure: "network", remembered: null }))
    expect(KEYS.openrouter.read()).toBe(OPENROUTER_KEY)
  })

  it("asks for a six-digit PIN twice, refuses common ones, and remembers the key under a good one", async () => {
    fetchMock.mockResolvedValue(json({ data: { limit: null, usage: 0 } }))
    const { field, button, ack, onConnected, onVaultChange } = setup("openrouter")
    await userEvent.click(ack)
    await userEvent.click(screen.getByRole("radio", { name: new RegExp(copy.setup.storage.remember) }))
    const pin = screen.getByLabelText(copy.setup.pin.label)
    const repeat = screen.getByLabelText(copy.setup.pin.repeat)
    expect(pin).toHaveAttribute("inputmode", "numeric")

    await userEvent.type(field, OPENROUTER_KEY)
    await userEvent.type(pin, "123456")
    await userEvent.type(repeat, "123456")
    await userEvent.click(button)
    expect(screen.getByRole("alert")).toHaveTextContent(copy.setup.pin.common)
    expect(fetchMock).not.toHaveBeenCalled()

    await userEvent.clear(pin)
    await userEvent.clear(repeat)
    await userEvent.type(pin, "48a29-15")
    expect(pin).toHaveValue("482915")
    await userEvent.type(repeat, "482916")
    await userEvent.click(button)
    expect(screen.getByRole("alert")).toHaveTextContent(copy.setup.pin.mismatch)

    await userEvent.clear(repeat)
    await userEvent.type(repeat, "482915")
    await userEvent.click(button)
    await waitFor(() => expect(onConnected).toHaveBeenCalledOnce(), { timeout: 10_000 })
    expect(onConnected.mock.calls[0][0]).toMatchObject({ failure: null, remembered: true })
    expect(onVaultChange).toHaveBeenCalled()
    expect(await listVault()).toEqual([expect.objectContaining({ provider: "openrouter", last4: OPENROUTER_KEY.slice(-4), failedAttempts: 0 })])
    expect(pin).toHaveValue("")
  }, 20_000)
})

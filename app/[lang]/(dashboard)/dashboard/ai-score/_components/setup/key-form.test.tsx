import { fireEvent, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { isPlausibleOpenRouterKey, openRouterKey } from "@/lib/assistant/openrouter/key"
import { clearGatewayKey, readGatewayKey } from "@/lib/assistant/gateway/key"
import { forgetKey, listVault, rememberKey } from "@/lib/assistant/vault/vault"
import { EMPTY_VALUE } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { aiScoreCopy, aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { KeyForm } from "./key-form"

// A cheap PIN derivation keeps this test fast; the real count is pinned in `crypto.test.ts`.
vi.mock("@/lib/assistant/vault/crypto", async (original) => ({ ...(await original<typeof import("@/lib/assistant/vault/crypto")>()), PBKDF2_ITERATIONS: 1000 }))

const KEY = "vck_test_0123456789abcdefWXYZ"
const OR_KEY = `sk-or-v1-${"ab".repeat(32)}ab`
const copy = aiScoreCopy()

afterEach(async () => {
  clearGatewayKey()
  openRouterKey.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  await forgetKey("gateway")
  await forgetKey("openrouter")
})

/** Stubs the providers' key-check endpoints; returns the URLs that were fetched. */
function stubChecks({ gatewayStatus, balance = "4.2", openrouterStatus, info }: { gatewayStatus?: number; balance?: string; openrouterStatus?: number; info?: object } = {}) {
  const urls: string[] = []
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      urls.push(url)
      if (url.includes("ai-gateway.vercel.sh/v1/credits")) {
        if (gatewayStatus) return new Response("nope", { status: gatewayStatus })
        return Response.json({ balance, total_used: "0.8" })
      }
      if (url.includes("openrouter.ai/api/v1/key")) {
        if (openrouterStatus) return new Response("nope", { status: openrouterStatus })
        return Response.json({ data: { limit: 5, limit_remaining: 3.2, limit_reset: "monthly", usage: 1.8, expires_at: "2027-01-04T00:00:00.000Z", ...info } })
      }
      return new Response("not found", { status: 404 })
    }),
  )
  return urls
}

/** Renders the form; by default with the spending-limit and expiry notice already confirmed. */
function setup(provider: "gateway" | "openrouter" = "gateway", { ack = true } = {}) {
  const urls = stubChecks()
  renderAiScore(<KeyForm provider={provider} />, { store: aiScoreStore(example()).store })
  const field = screen.getByLabelText(copy.setup.key.label[provider])
  if (ack) fireEvent.click(screen.getByRole("checkbox", { name: copy.setup.notice.ack }))
  return { urls, field }
}

describe("KeyForm: spending-limit and expiry notice (O7)", () => {
  it("tells the user to set both on the key, after the provider's docs, before the key is used", async () => {
    const { field, urls } = setup("gateway", { ack: false })
    const notice = screen.getByRole("region", { name: copy.setup.notice.title })
    expect(notice).toHaveTextContent(copy.setup.notice.gateway.limit)
    expect(notice).toHaveTextContent(copy.setup.notice.gateway.expiry)
    expect(screen.getByRole("link", { name: copy.setup.notice.gateway.docs })).toHaveAttribute("href", copy.setup.notice.gateway.docsUrl)
    const box = screen.getByRole("checkbox", { name: copy.setup.notice.ack })
    expect(box).toBeRequired()
    expect(screen.getByRole("button", { name: copy.setup.key.use })).toBeDisabled()
    await userEvent.type(field, `${KEY}{Enter}`)
    expect(readGatewayKey()).toBeNull()
    expect(urls).toEqual([])
    await userEvent.click(box)
    expect(screen.getByRole("button", { name: copy.setup.key.use })).toBeEnabled()
  })

  it("shows OpenRouter's limit and expiry docs when that provider is chosen", () => {
    setup("openrouter", { ack: false })
    const notice = screen.getByRole("region", { name: copy.setup.notice.title })
    expect(notice).toHaveTextContent(copy.setup.notice.openrouter.limit)
    expect(notice).toHaveTextContent(copy.setup.notice.openrouter.expiry)
    expect(screen.getByRole("link", { name: copy.setup.notice.openrouter.docs })).toHaveAttribute("href", copy.setup.notice.openrouter.docsUrl)
  })

  it("asks for the confirmation again for the next key, after a key is used or forgotten", async () => {
    const { field } = setup()
    const box = screen.getByRole("checkbox", { name: copy.setup.notice.ack })
    const use = screen.getByRole("button", { name: copy.setup.key.use })
    await userEvent.type(field, KEY)
    await userEvent.click(use)
    expect(await screen.findByText("Key accepted. Balance: $4.20")).toBeInTheDocument()
    expect(box).not.toBeChecked()
    expect(use).toBeDisabled()
    await userEvent.click(box)
    await userEvent.click(screen.getByRole("button", { name: copy.setup.key.forget }))
    expect(readGatewayKey()).toBeNull()
    expect(box).not.toBeChecked()
    expect(use).toBeDisabled()
  })

  it("keeps the confirmation when the provider rejects the key, so the next try needs no second tick", async () => {
    stubChecks({ gatewayStatus: 401 })
    renderAiScore(<KeyForm provider="gateway" />, { store: aiScoreStore(example()).store })
    fireEvent.click(screen.getByRole("checkbox", { name: copy.setup.notice.ack }))
    await userEvent.type(screen.getByLabelText(copy.setup.key.label.gateway), KEY)
    await userEvent.click(screen.getByRole("button", { name: copy.setup.key.use }))
    expect(await screen.findByText(/has been forgotten/)).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: copy.setup.notice.ack })).toBeChecked()
  })
})

describe("KeyForm: a key remembered in the assistant's vault (D-50)", () => {
  const remember = () => rememberKey("gateway", KEY, "482915")

  it("offers to unlock it into memory with the PIN", async () => {
    await remember()
    setup()
    expect(await screen.findByRole("heading", { name: copy.setup.unlock.title })).toBeInTheDocument()
    expect(screen.getByText(interpolate(copy.setup.unlock.lead, { provider: copy.setup.providers.gateway, last4: "WXYZ" }))).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText(copy.setup.unlock.pin), "482915")
    await userEvent.click(screen.getByRole("button", { name: copy.setup.unlock.unlock }))
    await waitFor(() => expect(readGatewayKey()).toBe(KEY), { timeout: 10_000 })
    expect(screen.getByText("Key in use: …WXYZ")).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: copy.setup.unlock.title })).not.toBeInTheDocument()
    expect(document.body.innerHTML).not.toContain(KEY)
  })

  it("lets the user paste a key instead, which stays in memory only", async () => {
    await remember()
    setup()
    await userEvent.click(await screen.findByRole("button", { name: copy.setup.unlock.other }))
    expect(screen.queryByRole("heading", { name: copy.setup.unlock.title })).not.toBeInTheDocument()
    await userEvent.type(screen.getByLabelText(copy.setup.key.label.gateway), `${KEY}{Enter}`)
    expect(readGatewayKey()).toBe(KEY)
    expect(await listVault()).toHaveLength(1)
  })

  it("removes it without the PIN", async () => {
    await remember()
    setup()
    await userEvent.click(await screen.findByRole("button", { name: copy.setup.unlock.remove }))
    await waitFor(() => expect(screen.queryByRole("heading", { name: copy.setup.unlock.title })).not.toBeInTheDocument())
    expect(await listVault()).toEqual([])
    expect(readGatewayKey()).toBeNull()
  })

  it("offers nothing of the other provider, and nothing when no key is remembered", async () => {
    await remember()
    setup("openrouter")
    await waitFor(() => expect(screen.getByRole("region", { name: copy.setup.notice.title })).toBeInTheDocument())
    // The remembered Gateway key is offered only once the Gateway is chosen.
    expect(screen.queryByRole("heading", { name: copy.setup.unlock.title })).not.toBeInTheDocument()
    expect(screen.getByLabelText(copy.setup.key.label.openrouter)).toBeInTheDocument()
  })
})

describe("KeyForm (bring your own key, D-71)", () => {
  it("is a password field without autofill or spellcheck, and starts without a key", () => {
    const { field } = setup()
    expect(field).toHaveAttribute("type", "password")
    expect(field).toHaveAttribute("autocomplete", "off")
    expect(field).toHaveAttribute("spellcheck", "false")
    expect(field).not.toHaveAttribute("name")
    expect(field.closest("form")).toBeNull()
    expect(field).toHaveAttribute("data-1p-ignore")
    expect(field).toHaveAttribute("data-lpignore", "true")
    expect(field).toHaveAttribute("data-bwignore")
    expect(field).toHaveAttribute("data-form-type", "other")
    expect(screen.getByText(copy.setup.key.none)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: copy.setup.key.forget })).not.toBeInTheDocument()
    expect(screen.getByText(copy.setup.key.memory.gateway)).toBeInTheDocument()
  })

  it("rejects what cannot be a key", async () => {
    const { field, urls } = setup()
    await userEvent.type(field, "short key")
    await userEvent.click(screen.getByRole("button", { name: copy.setup.key.use }))
    expect(screen.getByRole("status")).toHaveTextContent(copy.setup.key.invalid.gateway)
    expect(field).toHaveAttribute("aria-invalid", "true")
    expect(readGatewayKey()).toBeNull()
    expect(urls).toEqual([])
  })

  it("keeps the key in memory only, empties the field, shows it masked and the balance", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem")
    const pushState = vi.spyOn(window.history, "pushState")
    const replaceState = vi.spyOn(window.history, "replaceState")
    const { field, urls } = setup()
    await userEvent.type(field, KEY)
    await userEvent.click(screen.getByRole("button", { name: copy.setup.key.use }))
    expect(readGatewayKey()).toBe(KEY)
    expect(field).toHaveValue("")
    expect(urls).toEqual(["https://ai-gateway.vercel.sh/v1/credits"])
    expect(await screen.findByText("Key accepted. Balance: $4.20")).toBeInTheDocument()
    expect(screen.getByText("Key in use: …WXYZ")).toBeInTheDocument()
    expect(document.body.innerHTML).not.toContain(KEY)
    expect(window.location.href).not.toContain(KEY)
    expect(setItem).not.toHaveBeenCalled()
    expect(pushState).not.toHaveBeenCalled()
    expect(replaceState).not.toHaveBeenCalled()
  })

  it("uses the key on Enter too", async () => {
    const { field, urls } = setup()
    await userEvent.type(field, `${KEY}{Enter}`)
    expect(readGatewayKey()).toBe(KEY)
    expect(field).toHaveValue("")
    expect(urls).toHaveLength(1)
    expect(await screen.findByText("Key accepted. Balance: $4.20")).toBeInTheDocument()
  })

  it("on OpenRouter shows the limit and the expiry the key reports", async () => {
    const { field, urls } = setup("openrouter")
    await userEvent.type(field, OR_KEY)
    await userEvent.click(screen.getByRole("button", { name: copy.setup.key.use }))
    expect(await screen.findByText(copy.setup.credits.accepted)).toBeInTheDocument()
    expect(screen.getByText(/Credit limit of this key: \$5\.00, \$3\.20 left\. It resets every month\./)).toBeInTheDocument()
    expect(screen.getByText(/The key expires on/)).toBeInTheDocument()
    expect(isPlausibleOpenRouterKey(OR_KEY)).toBe(true)
    expect(openRouterKey.read()).toBe(OR_KEY)
    expect(readGatewayKey()).toBeNull()
    expect(urls).toEqual(["https://openrouter.ai/api/v1/key"])
  })

  it("on OpenRouter warns when the key has no limit and no expiry", async () => {
    stubChecks({ info: { limit: null, limit_remaining: null, limit_reset: null, expires_at: null } })
    renderAiScore(<KeyForm provider="openrouter" />, { store: aiScoreStore(example()).store })
    fireEvent.click(screen.getByRole("checkbox", { name: copy.setup.notice.ack }))
    await userEvent.type(screen.getByLabelText(copy.setup.key.label.openrouter), OR_KEY)
    await userEvent.click(screen.getByRole("button", { name: copy.setup.key.use }))
    expect(await screen.findByText(copy.setup.credits.noLimit)).toBeInTheDocument()
    expect(screen.getByText(copy.setup.credits.noExpiry)).toBeInTheDocument()
  })

  it("shows the empty value when the Gateway sends no readable balance", async () => {
    const { field } = setup()
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ balance: "n/a", total_used: "0" })),
    )
    await userEvent.type(field, KEY)
    await userEvent.click(screen.getByRole("button", { name: copy.setup.key.use }))
    expect(await screen.findByText(`Key accepted. Balance: ${EMPTY_VALUE}`)).toBeInTheDocument()
  })

  it("keeps the key when only the balance check fails", async () => {
    const { field } = setup()
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 503 })))
    await userEvent.type(field, KEY)
    await userEvent.click(screen.getByRole("button", { name: copy.setup.key.use }))
    expect(await screen.findByText(/The key is kept, but it could not be checked/)).toHaveTextContent(copy.errors.provider)
    expect(readGatewayKey()).toBe(KEY)
  })

  it("forgets a key the provider rejects", async () => {
    const { field } = setup()
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nope", { status: 401 })))
    await userEvent.type(field, KEY)
    await userEvent.click(screen.getByRole("button", { name: copy.setup.key.use }))
    expect(await screen.findByText(/has been forgotten/)).toHaveTextContent(copy.errors.key)
    expect(readGatewayKey()).toBeNull()
    expect(screen.getByText(copy.setup.key.none)).toBeInTheDocument()
  })

  it("forgets the key on demand", async () => {
    const { field } = setup()
    await userEvent.type(field, KEY)
    await userEvent.click(screen.getByRole("button", { name: copy.setup.key.use }))
    await userEvent.click(await screen.findByRole("button", { name: copy.setup.key.forget }))
    expect(readGatewayKey()).toBeNull()
    expect(screen.getByText(copy.setup.key.none)).toBeInTheDocument()
  })
})

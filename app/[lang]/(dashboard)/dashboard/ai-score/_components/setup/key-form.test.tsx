import { fireEvent, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { clearGatewayKey, readGatewayKey } from "@/lib/assistant/gateway/key"
import { forgetKey, listVault, rememberKey } from "@/lib/assistant/vault/vault"
import { EMPTY_VALUE } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { fakeClient } from "../test-utils/fake-client"
import { aiScoreCopy, aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { KeyForm } from "./key-form"

// A cheap PIN derivation keeps this test fast; the real count is pinned in `crypto.test.ts`.
vi.mock("@/lib/assistant/vault/crypto", async (original) => ({ ...(await original<typeof import("@/lib/assistant/vault/crypto")>()), PBKDF2_ITERATIONS: 1000 }))

const KEY = "vck_test_0123456789abcdefWXYZ"
const copy = aiScoreCopy()

afterEach(async () => {
  clearGatewayKey()
  vi.restoreAllMocks()
  await forgetKey("gateway")
})

/** Renders the form; by default with the spending-limit and expiry notice already confirmed. */
function setup(options: Parameters<typeof fakeClient>[0] = {}, { ack = true } = {}) {
  const fake = fakeClient(options)
  renderAiScore(<KeyForm createClient={fake.create} />, { store: aiScoreStore(example()).store })
  const field = screen.getByLabelText(copy.setup.key.label)
  if (ack) fireEvent.click(screen.getByRole("checkbox", { name: copy.setup.notice.ack }))
  return { fake, field }
}

describe("KeyForm: spending-limit and expiry notice (O7)", () => {
  it("tells the user to set both on the key, after Vercel's docs, before the key is used", async () => {
    const { field, fake } = setup({}, { ack: false })
    const notice = screen.getByRole("region", { name: copy.setup.notice.title })
    expect(notice).toHaveTextContent(copy.setup.notice.limit)
    expect(notice).toHaveTextContent(copy.setup.notice.expiry)
    expect(screen.getByRole("link", { name: copy.setup.notice.docs })).toHaveAttribute("href", copy.setup.notice.docsUrl)
    const box = screen.getByRole("checkbox", { name: copy.setup.notice.ack })
    expect(box).toBeRequired()
    expect(screen.getByRole("button", { name: copy.setup.key.use })).toBeDisabled()
    await userEvent.type(field, `${KEY}{Enter}`)
    expect(readGatewayKey()).toBeNull()
    expect(fake.create).not.toHaveBeenCalled()
    await userEvent.click(box)
    expect(screen.getByRole("button", { name: copy.setup.key.use })).toBeEnabled()
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

  it("keeps the confirmation when the Gateway rejects the key, so the next try needs no second tick", async () => {
    const { field } = setup({ creditsStatus: 401 })
    await userEvent.type(field, KEY)
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
    expect(screen.getByText(interpolate(copy.setup.unlock.lead, { provider: copy.setup.unlock.provider, last4: "WXYZ" }))).toBeInTheDocument()
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
    await userEvent.type(screen.getByLabelText(copy.setup.key.label), `${KEY}{Enter}`)
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

  it("offers nothing to unlock when no key is remembered", async () => {
    setup()
    await waitFor(() => expect(screen.getByRole("region", { name: copy.setup.notice.title })).toBeInTheDocument())
    expect(screen.queryByRole("heading", { name: copy.setup.unlock.title })).not.toBeInTheDocument()
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
    expect(screen.getByText(copy.setup.key.memory)).toBeInTheDocument()
  })

  it("rejects what cannot be a key", async () => {
    const { field, fake } = setup()
    await userEvent.type(field, "short key")
    await userEvent.click(screen.getByRole("button", { name: copy.setup.key.use }))
    expect(screen.getByRole("status")).toHaveTextContent(copy.setup.key.invalid)
    expect(field).toHaveAttribute("aria-invalid", "true")
    expect(readGatewayKey()).toBeNull()
    expect(fake.create).not.toHaveBeenCalled()
  })

  it("keeps the key in memory only, empties the field, shows it masked and the balance", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem")
    const pushState = vi.spyOn(window.history, "pushState")
    const replaceState = vi.spyOn(window.history, "replaceState")
    const { field, fake } = setup({ balance: "4.2" })
    await userEvent.type(field, KEY)
    await userEvent.click(screen.getByRole("button", { name: copy.setup.key.use }))
    expect(readGatewayKey()).toBe(KEY)
    expect(field).toHaveValue("")
    expect(fake.create).toHaveBeenCalledWith(KEY)
    expect(await screen.findByText("Key accepted. Balance: $4.20")).toBeInTheDocument()
    expect(screen.getByText("Key in use: …WXYZ")).toBeInTheDocument()
    expect(document.body.innerHTML).not.toContain(KEY)
    expect(window.location.href).not.toContain(KEY)
    expect(setItem).not.toHaveBeenCalled()
    expect(pushState).not.toHaveBeenCalled()
    expect(replaceState).not.toHaveBeenCalled()
  })

  it("uses the key on Enter too", async () => {
    const { field, fake } = setup()
    await userEvent.type(field, `${KEY}{Enter}`)
    expect(readGatewayKey()).toBe(KEY)
    expect(field).toHaveValue("")
    expect(fake.create).toHaveBeenCalledTimes(1)
    expect(await screen.findByText("Key accepted. Balance: $4.20")).toBeInTheDocument()
  })

  it("shows the empty value when the Gateway sends no readable balance", async () => {
    const { field } = setup({ balance: "n/a" })
    await userEvent.type(field, KEY)
    await userEvent.click(screen.getByRole("button", { name: copy.setup.key.use }))
    expect(await screen.findByText(`Key accepted. Balance: ${EMPTY_VALUE}`)).toBeInTheDocument()
  })

  it("keeps the key when only the balance check fails", async () => {
    const { field } = setup({ creditsStatus: 503 })
    await userEvent.type(field, KEY)
    await userEvent.click(screen.getByRole("button", { name: copy.setup.key.use }))
    expect(await screen.findByText(/The key is kept, but the balance could not be checked/)).toHaveTextContent(copy.errors.provider)
    expect(readGatewayKey()).toBe(KEY)
  })

  it("forgets a key the Gateway rejects", async () => {
    const { field } = setup({ creditsStatus: 401 })
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

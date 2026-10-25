import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { clearGatewayKey, readGatewayKey } from "@/lib/assistant/gateway/key"
import { EMPTY_VALUE } from "@/lib/i18n/format"
import { fakeClient } from "../test-utils/fake-client"
import { aiScoreCopy, aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { KeyForm } from "./key-form"

const KEY = "vck_test_0123456789abcdefWXYZ"
const copy = aiScoreCopy()

afterEach(() => {
  clearGatewayKey()
  vi.restoreAllMocks()
})

function setup(options: Parameters<typeof fakeClient>[0] = {}) {
  const fake = fakeClient(options)
  renderAiScore(<KeyForm createClient={fake.create} />, { store: aiScoreStore(example()).store })
  const field = screen.getByLabelText(copy.setup.key.label)
  return { fake, field }
}

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

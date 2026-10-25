import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { KEYS } from "@/lib/assistant/keys/registry"
import { forgetKey, listVault, MAX_ATTEMPTS, rememberKey } from "@/lib/assistant/vault/vault"
import { interpolate } from "@/lib/i18n/interpolate"
import { assistantCopy, renderAgent } from "../test-utils/render"
import { UnlockForm } from "./unlock-form"

// A cheap PIN derivation keeps this test fast; the real count is pinned in `crypto.test.ts`.
vi.mock("@/lib/assistant/vault/crypto", async (original) => ({ ...(await original<typeof import("@/lib/assistant/vault/crypto")>()), PBKDF2_ITERATIONS: 1000 }))

const copy = assistantCopy()
const KEY = "vck_remembered_gateway_key_0000c0de"
const PIN = "482915"

afterEach(async () => {
  KEYS.gateway.clear()
  await forgetKey("gateway")
})

async function setup() {
  await rememberKey("gateway", KEY, PIN)
  const [entry] = await listVault()
  const onDone = vi.fn()
  const onRemoved = vi.fn()
  const onOther = vi.fn()
  renderAgent(<UnlockForm copy={copy.unlock} provider="gateway" providerName={copy.providers.gateway} entry={entry} onDone={onDone} onRemoved={onRemoved} onOther={onOther} />)
  return { onDone, onRemoved, onOther, pin: screen.getByLabelText(copy.unlock.pin), button: screen.getByRole("button", { name: copy.unlock.unlock }) }
}

describe("UnlockForm", () => {
  it("names the remembered key by provider and last four characters only", async () => {
    await setup()
    expect(screen.getByText(interpolate(copy.unlock.lead, { provider: copy.providers.gateway, last4: "c0de" }))).toBeInTheDocument()
    expect(document.body).not.toHaveTextContent(KEY)
  }, 20_000)

  it("opens the key into memory with the right PIN", async () => {
    const { onDone, pin, button } = await setup()
    expect(button).toBeDisabled()
    await userEvent.type(pin, PIN)
    await userEvent.click(button)
    await waitFor(() => expect(onDone).toHaveBeenCalledWith({ status: "ok" }), { timeout: 10_000 })
    expect(KEYS.gateway.read()).toBe(KEY)
    expect(pin).toHaveValue("")
  }, 20_000)

  it("counts wrong PINs down and reports the deletion after the last one", async () => {
    const { onDone, pin, button } = await setup()
    await userEvent.type(pin, "111112")
    await userEvent.click(button)
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(interpolate(copy.unlock.wrong, { remaining: MAX_ATTEMPTS - 1 })), { timeout: 10_000 })
    expect(onDone).not.toHaveBeenCalled()
    expect(KEYS.gateway.read()).toBeNull()
    for (let attempt = 2; attempt <= MAX_ATTEMPTS; attempt++) {
      await userEvent.type(pin, "111112")
      await userEvent.click(button)
      await waitFor(() => expect(pin).toHaveValue(""), { timeout: 10_000 })
      await waitFor(() => expect(screen.getByRole("status")).not.toHaveTextContent(copy.unlock.unlocking), { timeout: 10_000 })
    }
    await waitFor(() => expect(onDone).toHaveBeenCalledWith({ status: "wiped" }))
    expect(screen.getByRole("status")).toHaveTextContent(copy.unlock.wiped)
    expect(await listVault()).toEqual([])
  }, 60_000)

  it("removes the remembered key without the PIN", async () => {
    const { onDone, onRemoved } = await setup()
    await userEvent.click(screen.getByRole("button", { name: copy.unlock.remove }))
    await waitFor(() => expect(onRemoved).toHaveBeenCalledOnce())
    expect(onDone).not.toHaveBeenCalled()
    expect(await listVault()).toEqual([])
    expect(KEYS.gateway.read()).toBeNull()
  }, 20_000)

  it("offers to paste another key instead", async () => {
    const { onOther } = await setup()
    await userEvent.click(screen.getByRole("button", { name: copy.unlock.other }))
    expect(onOther).toHaveBeenCalledOnce()
  }, 20_000)
})

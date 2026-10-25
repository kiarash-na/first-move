import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { KEYS } from "@/lib/assistant/keys/registry"
import { forgetKey, listVault, rememberKey } from "@/lib/assistant/vault/vault"
import { formatDate } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { assistantCopy, renderAgent } from "../test-utils/render"
import { KeyStatus } from "./key-status"
import type { ConnectOutcome } from "./key-setup"

const copy = assistantCopy()
const text = copy.setup
const KEY = `sk-or-v1-${"5a".repeat(32)}`

afterEach(async () => {
  KEYS.openrouter.clear()
  await forgetKey("openrouter")
})

const openRouter = (info: Partial<{ limit: number | null; limitRemaining: number | null; limitReset: string | null; expiresAt: string | null }>): ConnectOutcome => ({
  check: { provider: "openrouter", info: { limit: null, limitRemaining: null, limitReset: null, usage: 0, expiresAt: null, ...info } },
  failure: null,
  remembered: null,
})

describe("KeyStatus", () => {
  it("shows the masked key and the key's credit limit, reset and expiry", () => {
    renderAgent(<KeyStatus provider="openrouter" masked="…5a5a" outcome={openRouter({ limit: 10, limitRemaining: 9.5, limitReset: "monthly", expiresAt: "2026-12-31T00:00:00Z" })} entry={undefined} onVaultChange={vi.fn()} />)
    expect(screen.getByText(interpolate(text.active, { masked: "…5a5a", provider: copy.providers.openrouter }))).toBeInTheDocument()
    expect(screen.getByText("Credit limit of this key: $10.00, $9.50 left. It resets every month.")).toBeInTheDocument()
    expect(screen.getByText(interpolate(text.expires, { date: formatDate("2026-12-31T00:00:00Z", "en") }))).toBeInTheDocument()
    expect(document.querySelectorAll("[data-warn]")).toHaveLength(0)
  })

  it("warns when the OpenRouter key has no credit limit or no expiry", () => {
    renderAgent(<KeyStatus provider="openrouter" masked="…5a5a" outcome={openRouter({})} entry={undefined} onVaultChange={vi.fn()} />)
    expect(screen.getByText(text.noLimit)).toHaveAttribute("data-warn", "true")
    expect(screen.getByText(text.noExpiry)).toHaveAttribute("data-warn", "true")
  })

  it("shows the Gateway balance, or why the check failed", () => {
    const { unmount } = renderAgent(<KeyStatus provider="gateway" masked="…7a1c" outcome={{ check: { provider: "gateway", balance: 12.5 }, failure: null, remembered: null }} entry={undefined} onVaultChange={vi.fn()} />)
    expect(screen.getByText("Gateway balance: $12.50")).toBeInTheDocument()
    unmount()
    renderAgent(<KeyStatus provider="gateway" masked="…7a1c" outcome={{ check: null, failure: "network", remembered: false }} entry={undefined} onVaultChange={vi.fn()} />)
    expect(screen.getByText(interpolate(text.failed, { reason: copy.errors.network }))).toBeInTheDocument()
  })

  it("forgets the key in this tab, and removes the remembered one from the device", async () => {
    KEYS.openrouter.set(KEY)
    await rememberKey("openrouter", KEY, "482915", { iterations: 1000 })
    const [entry] = await listVault()
    const onVaultChange = vi.fn()
    renderAgent(<KeyStatus provider="openrouter" masked="…5a5a" outcome={null} entry={entry} onVaultChange={onVaultChange} />)
    expect(screen.getByText(text.remembered)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: text.forget }))
    expect(KEYS.openrouter.read()).toBeNull()
    await userEvent.click(screen.getByRole("button", { name: text.remove }))
    await waitFor(() => expect(onVaultChange).toHaveBeenCalledOnce())
    expect(await listVault()).toEqual([])
  })
})

import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import type { UnlockOutcome } from "@/lib/assistant/keys/unlock"
import { DEFAULT_MODEL } from "@/lib/assistant/providers/models"
import type { VaultEntry } from "@/lib/assistant/vault/vault"
import { assistantCopy, renderAgent } from "../test-utils/render"
import { ConnectionView } from "./connection-view"

const unlock = vi.hoisted(() => ({ next: { status: "ok" } as UnlockOutcome }))
vi.mock("@/lib/assistant/keys/unlock", async (original) => ({
  ...(await original<typeof import("@/lib/assistant/keys/unlock")>()),
  unlockInto: vi.fn(async () => unlock.next),
}))

const copy = assistantCopy()
const ENTRY: VaultEntry = { provider: "gateway", last4: "1234", createdAt: "2026-10-25T08:00:00.000Z", failedAttempts: 0 }

function view(overrides: Partial<Parameters<typeof ConnectionView>[0]> = {}) {
  const props = {
    provider: "gateway" as const,
    onProvider: vi.fn(),
    masked: null,
    entry: ENTRY,
    onVaultChange: vi.fn(),
    outcome: null,
    onOutcome: vi.fn(),
    modelId: DEFAULT_MODEL.gateway,
    onModel: vi.fn(),
    onChat: vi.fn(),
    ...overrides,
  }
  renderAgent(<ConnectionView {...props} />)
  return props
}

async function enterPin() {
  await userEvent.type(screen.getByLabelText(copy.unlock.pin), "482915")
  await userEvent.click(screen.getByRole("button", { name: copy.unlock.unlock }))
}

describe("ConnectionView", () => {
  it("goes to the chat after an unlock", async () => {
    unlock.next = { status: "ok" }
    const props = view()
    await enterPin()
    expect(props.onVaultChange).toHaveBeenCalled()
    expect(props.onOutcome).toHaveBeenCalledWith(null)
  })

  it("explains a deleted key above the setup once the record is gone", async () => {
    unlock.next = { status: "wiped" }
    const props = view()
    await enterPin()
    expect(props.onOutcome).not.toHaveBeenCalled()
    expect(props.onVaultChange).toHaveBeenCalled()
    expect(screen.getAllByText(copy.unlock.wiped).length).toBeGreaterThan(0)
  })

  it("shows the key in use, the model and the way back to the chat", async () => {
    const props = view({ masked: "…1234", entry: undefined })
    expect(screen.getByLabelText(copy.setup.model.label)).toHaveValue(DEFAULT_MODEL.gateway)
    await userEvent.click(screen.getByRole("button", { name: copy.panel.back }))
    expect(props.onChat).toHaveBeenCalledOnce()
  })
})

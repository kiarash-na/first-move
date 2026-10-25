// @vitest-environment node
import { describe, expect, it, vi } from "vitest"
import type { MailAgentEnv } from "../env"
import { testConfig } from "../gates/test-utils/context"

const live = vi.hoisted(() => ({ env: null as MailAgentEnv | null }))
vi.mock(import("../env"), async (importOriginal) => ({ ...(await importOriginal()), mailAgentEnv: () => live.env! }))

describe("relayDeps", () => {
  it("gives no clients while the configuration is incomplete or the relay is switched off", async () => {
    const { relayDeps } = await import("./deps")
    live.env = { status: "incomplete", enabled: false, missing: ["RESEND_API_KEY"], invalid: [] }
    expect(relayDeps()).toBeNull()
    live.env = { status: "ready", config: testConfig({ EMAIL_HUMAN_RELAY_ENABLED: "false" }) }
    expect(relayDeps()).toBeNull()
  })

  it("gives the clients when the relay is on, also while the agent is off", async () => {
    const { relayDeps } = await import("./deps")
    live.env = { status: "disabled", config: testConfig() }
    expect(relayDeps()).toMatchObject({ config: { humanRelay: true } })
  })
})

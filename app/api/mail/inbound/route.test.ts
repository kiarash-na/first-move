// @vitest-environment node
import { Webhook } from "svix"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { MailAgentEnv } from "@/lib/mail-agent/env"
import { testConfig } from "@/lib/mail-agent/gates/test-utils/context"
import { inboundEmail } from "@/workflows/inbound-email"

const mocks = vi.hoisted(() => ({ start: vi.fn(), env: null as unknown as MailAgentEnv }))
vi.mock("workflow/api", () => ({ start: mocks.start }))
vi.mock("@/lib/mail-agent/env", async (original) => ({ ...(await original()), mailAgentEnv: () => mocks.env }))
vi.mock("@/lib/mail-agent/store/redis", async () => {
  const { createMemoryStore } = await import("@/lib/mail-agent/store/memory-store")
  return { createRedisStore: () => createMemoryStore() }
})

const { POST } = await import("./route")

function signed(body: string) {
  const at = new Date()
  const signature = new Webhook(testConfig().resend.webhookSecret).sign("msg_route", at, body)
  const headers = { "svix-id": "msg_route", "svix-timestamp": String(Math.floor(at.getTime() / 1000)), "svix-signature": signature }
  return new Request("https://firstmove.energy/api/mail/inbound", { method: "POST", body, headers })
}

const body = JSON.stringify({ type: "inbox.email.received", data: { inbox_id: "inbox-agent", thread_id: "t1", email_id: "e1" } })

describe("POST /api/mail/inbound", () => {
  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => {})
    mocks.start.mockReset()
  })

  it("answers 404 while the email agent is not configured", async () => {
    mocks.env = { status: "incomplete", enabled: false, missing: ["RESEND_API_KEY"], invalid: [] }
    expect((await POST(signed(body))).status).toBe(404)
    expect(mocks.start).not.toHaveBeenCalled()
  })

  it("starts the inbound workflow with the email's ids", async () => {
    mocks.env = { status: "ready", config: testConfig() }
    expect((await POST(signed(body))).status).toBe(200)
    expect(mocks.start).toHaveBeenCalledWith(inboundEmail, [{ emailId: "e1", threadId: "t1", inboxId: "inbox-agent", origin: "webhook" }])
  })
})

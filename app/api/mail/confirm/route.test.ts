// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest"
import { recordConsent } from "@/lib/mail-agent/consent/consent"
import { addPending } from "@/lib/mail-agent/consent/pending"
import { confirmToken, tokenIdFor } from "@/lib/mail-agent/consent/token"
import type { MailAgentEnv } from "@/lib/mail-agent/env"
import { testConfig } from "@/lib/mail-agent/gates/test-utils/context"
import { keys } from "@/lib/mail-agent/store/keys"
import { createMemoryStore } from "@/lib/mail-agent/store/memory-store"
import { inboundEmail } from "@/workflows/inbound-email"

const store = createMemoryStore()
const mocks = vi.hoisted(() => ({ start: vi.fn(), env: null as unknown as MailAgentEnv }))
vi.mock("workflow/api", () => ({ start: mocks.start }))
vi.mock("@/lib/mail-agent/env", async (original) => ({ ...(await original()), mailAgentEnv: () => mocks.env }))
vi.mock("@/lib/mail-agent/store/redis", () => ({ createRedisStore: () => store }))
vi.mock("@/lib/mail-agent/consent/consent", async (original) => {
  const actual = await original<typeof import("@/lib/mail-agent/consent/consent")>()
  return { ...actual, recordConsent: vi.fn(actual.recordConsent) }
})

const { POST } = await import("./route")
const config = testConfig()

function post(token: string) {
  return new Request("https://firstmove.energy/api/mail/confirm", {
    method: "POST",
    body: JSON.stringify({ token }),
    headers: { "content-type": "application/json", origin: "https://firstmove.energy" },
  })
}

describe("POST /api/mail/confirm", () => {
  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => {})
    mocks.start.mockReset()
  })

  it("answers 404 while the email agent is not configured", async () => {
    mocks.env = { status: "incomplete", enabled: false, missing: ["RESEND_API_KEY"], invalid: [] }
    expect((await POST(post("v1.x"))).status).toBe(404)
  })

  it("records the current Terms and Privacy versions and starts the waiting email", async () => {
    mocks.env = { status: "ready", config }
    const tokenId = await tokenIdFor(config.secrets.confirm, "e1")
    await store.set(keys.confirm(tokenId), JSON.stringify({ sid: "sid-jane" }))
    await addPending(store, config.secrets.state, "sid-jane", { emailId: "e1", threadId: "t1", inboxId: "inbox-agent" }, Date.now())
    const token = await confirmToken(config.secrets.confirm, tokenId, Math.floor(Date.now() / 1000) + 3600)

    expect((await POST(post(token))).status).toBe(200)
    expect(mocks.start).toHaveBeenCalledWith(inboundEmail, [{ emailId: "e1", threadId: "t1", inboxId: "inbox-agent", origin: "consent" }])
    const [terms, privacy] = await Promise.all([import("@/dictionaries/en/terms.json"), import("@/dictionaries/en/privacy.json")])
    expect(recordConsent).toHaveBeenCalledWith(store, "sid-jane", expect.objectContaining({ terms: terms.default.version, privacy: privacy.default.version }))
  })
})

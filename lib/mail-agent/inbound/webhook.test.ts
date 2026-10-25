// @vitest-environment node
import { Resend } from "resend"
import { Webhook } from "svix"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { MailAgentEnv } from "../env"
import { testConfig } from "../gates/test-utils/context"
import type { InboundInput } from "../pipeline/types"
import type { InboundRef } from "./event"
import { keys } from "../store/keys"
import { createMemoryStore } from "../store/memory-store"
import { handleWebhook, MAX_WEBHOOK_BYTES, type WebhookDeps } from "./webhook"

const config = testConfig()
const ready: MailAgentEnv = { status: "ready", config }
// The signature library checks the timestamp against the real clock, so requests are signed now.
const now = Date.now()

function event(overrides: Record<string, unknown> = {}, type = "inbox.email.received") {
  return JSON.stringify({
    type,
    created_at: new Date(now).toISOString(),
    data: { inbox_id: "inbox-agent", thread_id: "thread-1", email_id: "email-1", email: { direction: "inbound" }, ...overrides },
  })
}

function request(body: string, { msgId = "msg_1", at = now, secret = config.resend.webhookSecret, headers = {} as Record<string, string> } = {}) {
  const signature = new Webhook(secret).sign(msgId, new Date(at), body)
  return new Request("https://firstmove.energy/api/mail/inbound", {
    method: "POST",
    body,
    headers: { "content-type": "application/json", "svix-id": msgId, "svix-timestamp": String(Math.floor(at / 1000)), "svix-signature": signature, ...headers },
  })
}

describe("handleWebhook", () => {
  let store: ReturnType<typeof createMemoryStore>
  let started: InboundInput[]
  let relayed: InboundRef[]
  let deps: WebhookDeps
  let lines: string[]

  beforeEach(() => {
    store = createMemoryStore()
    started = []
    relayed = []
    lines = []
    vi.spyOn(console, "info").mockImplementation((line: string) => void lines.push(line))
    deps = {
      env: ready,
      clients: () => ({ resend: new Resend("re_test_only"), store }),
      start: async (input) => void started.push(input),
      startRelay: async (ref) => void relayed.push(ref),
      now,
    }
  })

  it("starts one run for a signed email to the agent inbox, with ids only", async () => {
    const response = await handleWebhook(request(event()), deps)
    expect(response.status).toBe(200)
    expect(await response.text()).toBe("")
    expect(started).toEqual([{ emailId: "email-1", threadId: "thread-1", inboxId: "inbox-agent", origin: "webhook" }])
    expect(await store.get(keys.event("msg_1"))).toBe("1")
  })

  it("does not exist without a complete configuration", async () => {
    const clients = vi.fn()
    const env: MailAgentEnv = { status: "incomplete", enabled: true, missing: ["RESEND_API_KEY"], invalid: [] }
    const response = await handleWebhook(request(event()), { ...deps, env, clients })
    expect(response.status).toBe(404)
    expect(clients).not.toHaveBeenCalled()
    expect(started).toEqual([])
  })

  it("refuses a body above 256 KB, declared or streamed", async () => {
    const big = event({ padding: "x".repeat(MAX_WEBHOOK_BYTES) })
    expect((await handleWebhook(request(big), deps)).status).toBe(413)
    const lying = request(big, { headers: { "content-length": "100" } })
    expect((await handleWebhook(lying, deps)).status).toBe(413)
    expect(started).toEqual([])
  })

  it("refuses a bad signature, another secret and a stale timestamp, without detail", async () => {
    const body = event()
    const tampered = request(body)
    const changed = new Request(tampered.url, { method: "POST", body: body.replace("email-1", "email-2"), headers: tampered.headers })
    const responses = [
      await handleWebhook(changed, deps),
      await handleWebhook(request(body, { secret: `whsec_${Buffer.alloc(24, 1).toString("base64")}` }), deps),
      await handleWebhook(request(body, { at: now - 6 * 60_000 }), deps),
    ]
    expect(responses.map((response) => response.status)).toEqual([400, 400, 400])
    expect(await Promise.all(responses.map((response) => response.text()))).toEqual(["", "", ""])
    expect(started).toEqual([])
  })

  it("refuses a signed event it cannot read", async () => {
    expect((await handleWebhook(request(JSON.stringify({ type: "inbox.email.received", data: {} })), deps)).status).toBe(400)
    expect(started).toEqual([])
  })

  it("ignores other event types and outbound email", async () => {
    const responses = [
      await handleWebhook(request(event({}, "email.received"), { msgId: "msg_a" }), deps),
      await handleWebhook(request(event({ email: { direction: "outbound" } }), { msgId: "msg_c" }), deps),
      await handleWebhook(request(event({ inbox_id: "inbox-human", email: { direction: "outbound" } }), { msgId: "msg_d" }), deps),
    ]
    expect(responses.map((response) => response.status)).toEqual([200, 200, 200])
    expect(started).toEqual([])
    expect(relayed).toEqual([])
    expect(store.size()).toBe(0)
  })

  it("starts the human@ relay for another inbox, with ids only (O8)", async () => {
    expect((await handleWebhook(request(event({ inbox_id: "inbox-human" })), deps)).status).toBe(200)
    expect(relayed).toEqual([{ emailId: "email-1", threadId: "thread-1", inboxId: "inbox-human" }])
    expect(started).toEqual([])
    expect(lines.map((line) => JSON.parse(line).result)).toEqual(["relay-started"])
  })

  it("verifies, then drops the agent's mail while switched off; human@ still reaches a person", async () => {
    const env: MailAgentEnv = { status: "disabled", config }
    expect((await handleWebhook(request(event()), { ...deps, env })).status).toBe(200)
    expect((await handleWebhook(request(event(), { secret: `whsec_${Buffer.alloc(24, 1).toString("base64")}` }), { ...deps, env })).status).toBe(400)
    expect((await handleWebhook(request(event({ inbox_id: "inbox-human" }), { msgId: "msg_h" }), { ...deps, env })).status).toBe(200)
    expect(started).toEqual([])
    expect(relayed).toHaveLength(1)
    expect(lines.map((line) => JSON.parse(line).result)).toEqual(["disabled", "unverified", "relay-started"])
  })

  it("starts a repeated delivery of the same message once", async () => {
    await handleWebhook(request(event()), deps)
    const again = await handleWebhook(request(event()), deps)
    expect(again.status).toBe(200)
    expect(started).toHaveLength(1)
  })

  it("answers 500 and forgets the message when the start fails, so a retry starts it", async () => {
    const failing = { ...deps, start: async () => Promise.reject(new Error("queue down")) }
    expect((await handleWebhook(request(event()), failing)).status).toBe(500)
    expect(await store.get(keys.event("msg_1"))).toBeNull()
    expect((await handleWebhook(request(event()), deps)).status).toBe(200)
    expect(started).toHaveLength(1)
  })

  it("logs codes only", async () => {
    await handleWebhook(request(event()), deps)
    expect(lines.map((line) => JSON.parse(line))).toEqual([{ scope: "mail-agent", event: "webhook", result: "started", status: 200 }])
  })
})

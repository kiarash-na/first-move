// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest"
import { pendingOf } from "../consent/pending"
import { keys } from "../store/keys"
import { senderId } from "../store/sender-id"
import { spentToday } from "../store/budget"
import { pipelineHarness } from "./test-utils/harness"

const DAY = 86_400_000
const CONTENT = ["jane@example.org", "Quick Check for our village", "120 buildings on 12 ha"]

let consoleSpies: MockInstance[] = []

beforeEach(() => {
  consoleSpies = (["log", "info", "warn", "error", "debug"] as const).map((method) => vi.spyOn(console, method).mockImplementation(() => {}))
})

afterEach(() => {
  const logged = JSON.stringify(consoleSpies.flatMap((spy) => spy.mock.calls))
  for (const text of CONTENT) expect(logged, "logs carry no content").not.toContain(text)
  vi.restoreAllMocks()
})

describe("inbound flow: consent (D-54)", () => {
  it("asks a new sender once and lets no model read the email", async () => {
    const h = pipelineHarness()
    expect(await h.receive()).toBe("consent-asked")
    expect(h.jev.calls).toHaveLength(0)
    expect(h.fake.replies).toHaveLength(1)
    expect(h.fake.replies[0]).toMatchObject({ emailId: "email-1", threadId: "thread-email-1", idempotencyKey: "reply/email-1/confirm" })
    expect(h.fake.replies[0].text).toMatch(/https:\/\/firstmove\.energy\/en\/mail\/confirm#t=v1\.[\w-]{22}\.\d{10}\.[\w-]{43}/)
    expect(h.fake.replies[0].text).toContain("(https://firstmove.energy/en/terms)")
    const sid = await senderId(h.deps.config.secrets.hash, "jane@example.org")
    expect((await pendingOf(h.store, h.deps.config.secrets.state, sid, h.clock.now)).map((entry) => entry.emailId)).toEqual(["email-1"])
    expect(await h.store.get(keys.done("email-1"))).toBeNull()
  })

  it("sends one link a day, keeps at most three emails, and drops the rest", async () => {
    const h = pipelineHarness()
    expect(await h.receive()).toBe("consent-asked")
    expect(await h.receive()).toBe("consent-waiting")
    expect(await h.receive()).toBe("consent-waiting")
    expect(await h.receive()).toBe("pending-full")
    expect(h.fake.replies).toHaveLength(1)
    expect(await h.store.get(keys.done("email-4"))).toBe("pending-full")
  })

  it("sends the same link again when the step repeats", async () => {
    const h = pipelineHarness()
    await h.receive()
    const input = { emailId: "email-1", threadId: "thread-email-1", inboxId: "inbox-agent", origin: "webhook" as const }
    expect(await h.steps.askConsent(input, h.clock.now)).toBe("consent-asked")
    expect(h.fake.replies).toHaveLength(1)
  })
})

describe("inbound flow: guard and policy (D-52, D-55)", () => {
  it("judges a consented sender's email once and goes on to the answer", async () => {
    const h = pipelineHarness()
    await h.consent()
    expect(await h.receive()).toBe("allow")
    expect(h.jev.calls).toHaveLength(1)
    expect(h.fake.replies).toEqual([])
    expect(await h.store.get(keys.done("email-1"))).toBe("allow")
    expect(await spentToday(h.store, h.clock.now)).toBeGreaterThan(0)
    expect(await h.receive({ id: "email-1" } as never)).toBe("done")
  })

  it("warns on the first off-topic email, bans on the second, then stays silent", async () => {
    const h = pipelineHarness({ jev: { topic: "off_topic", offTopic: 0.9 } })
    await h.consent()
    expect(await h.receive()).toBe("strike-off_topic")
    expect(await h.receive()).toBe("strike-off_topic")
    expect(h.fake.replies.map((reply) => reply.idempotencyKey)).toEqual(["reply/email-1/warning", "reply/email-2/ban"])
    expect(await h.receive()).toBe("banned")
    expect(h.jev.calls).toHaveLength(2)
    h.clock.now += 31 * DAY
    expect(await h.receive()).toBe("strike-off_topic")
  })

  it("blocks an injection with one notice and an admin alert, then stays silent", async () => {
    const h = pipelineHarness({ jev: { injection: 0.95 } })
    await h.consent()
    expect(await h.receive()).toBe("block")
    expect(h.fake.replies.map((reply) => reply.idempotencyKey)).toEqual(["reply/email-1/block"])
    expect(h.fake.sent).toHaveLength(1)
    expect(h.fake.sent[0]).toMatchObject({ to: "owner@example.org", idempotencyKey: "alert/email-1/block" })
    expect(h.fake.sent[0].text).toContain("Category: injection")
    expect(await h.receive()).toBe("blocked")
    expect(h.fake.replies).toHaveLength(1)
    expect(h.fake.sent).toHaveLength(1)
  })

  it("counts a refusal as suspect and alerts the admin", async () => {
    const h = pipelineHarness({ jev: "refuse" })
    await h.consent()
    expect(await h.receive()).toBe("strike-suspect")
    expect(h.fake.replies.map((reply) => reply.idempotencyKey)).toEqual(["reply/email-1/warning"])
    expect(h.fake.sent[0].text).toContain("Category: refused")
  })

  it("tells the sender to try later when the guard fails, without a strike", async () => {
    const h = pipelineHarness({ jev: "fail" })
    await h.consent()
    expect(await h.receive()).toBe("unavailable")
    expect(h.fake.replies.map((reply) => reply.idempotencyKey)).toEqual(["reply/email-1/unavailable"])
    expect(h.fake.sent[0].text).toContain("Category: failed")
    const sid = await senderId(h.deps.config.secrets.hash, "jane@example.org")
    expect(await h.store.get(keys.strikes(sid))).toBeNull()
  })

  it("acts once when the act step repeats", async () => {
    const h = pipelineHarness({ jev: { topic: "off_topic", offTopic: 0.9 } })
    await h.consent()
    await h.receive()
    const input = { emailId: "email-1", threadId: "thread-email-1", inboxId: "inbox-agent", origin: "webhook" as const }
    const judged = { ok: true as const, decision: { topic: "off_topic" as const, offTopic: 0.9, intent: "other" as const, injection: 0, harassment: 0, malicious: 0 }, inputTokens: 1 }
    expect(await h.steps.act(input, judged, h.clock.now)).toEqual({ next: "stop", code: "strike-off_topic" })
    expect(h.fake.replies.map((reply) => reply.idempotencyKey)).toEqual(["reply/email-1/warning"])
  })

  it("answers the From address, never a Reply-To that points elsewhere", async () => {
    const h = pipelineHarness({ jev: { harassment: 0.7 } })
    await h.consent()
    expect(await h.receive({ replyTo: ["victim@example.com"] })).toBe("strike-suspect")
    expect(h.fake.replies).toEqual([])
    expect(h.fake.sent).toHaveLength(1)
    expect(h.fake.sent[0]).toMatchObject({ to: "jane@example.org", idempotencyKey: "reply/email-1/warning" })
  })
})

describe("inbound flow: gates", () => {
  it("drops a forged email silently and for good", async () => {
    const h = pipelineHarness()
    expect(await h.receive({ authentication: { spf: "pass", dkim: "fail", dmarc: "fail" } })).toBe("dmarc")
    expect(h.fake.replies).toEqual([])
    expect(h.jev.calls).toEqual([])
    expect(await h.store.get(keys.done("email-1"))).toBe("dmarc")
  })

  it("alerts the admin once a day when all mail hits the global limit", async () => {
    const h = pipelineHarness({ config: { EMAIL_AGENT_GLOBAL_PER_DAY: "1" } })
    await h.consent()
    expect(await h.receive()).toBe("allow")
    expect(await h.receive({ from: "max@example.com" })).toBe("rate-global")
    expect(await h.receive({ from: "eva@example.net" })).toBe("rate-global")
    expect(h.fake.sent.map((email) => email.idempotencyKey)).toEqual(["alert/rate-global/2026-10-24"])
  })

  it("pauses silently when the budget is spent", async () => {
    const h = pipelineHarness({ config: { EMAIL_AGENT_DAILY_BUDGET_USD: "0.0001" } })
    await h.consent()
    await h.store.incr(keys.budget("2026-10-24"), DAY, 100)
    expect(await h.receive()).toBe("budget")
    expect(h.fake.sent.map((email) => email.idempotencyKey)).toEqual(["alert/budget/2026-10-24"])
    expect(h.jev.calls).toEqual([])
  })

  it("does not count a confirmed email against the limits twice", async () => {
    const h = pipelineHarness({ config: { EMAIL_AGENT_SENDER_PER_HOUR: "1" } })
    expect(await h.receive()).toBe("consent-asked")
    await h.consent()
    expect(await h.receive({ id: "email-1" } as never, "consent")).toBe("allow")
  })
})

describe("inbound flow: step payloads", () => {
  it("carry ids, codes and numbers only, never content", async () => {
    const h = pipelineHarness({ jev: { injection: 0.95 } })
    await h.receive()
    await h.consent()
    await h.receive()
    const payloads = JSON.stringify(h.payloads)
    expect(h.payloads.length).toBeGreaterThan(4)
    for (const text of CONTENT) expect(payloads).not.toContain(text)
  })
})

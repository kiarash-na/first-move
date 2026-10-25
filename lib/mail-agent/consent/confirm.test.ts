// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { MailAgentEnv } from "../env"
import { inboundFlow } from "../pipeline/flow"
import { pipelineHarness } from "../pipeline/test-utils/harness"
import type { InboundInput } from "../pipeline/types"
import { keys } from "../store/keys"
import { senderId } from "../store/sender-id"
import { confirmToken, tokenIdFor } from "./token"
import { CONFIRM_STATUS, handleConfirm, type ConfirmDeps } from "./confirm"
import { pendingOf } from "./pending"

const DAY = 86_400_000

describe("handleConfirm", () => {
  let h: ReturnType<typeof pipelineHarness>
  let started: InboundInput[]
  let deps: ConfirmDeps
  let lines: string[]

  /** Lets one email ask for consent and returns the token from the link it sent. */
  async function asked(): Promise<string> {
    await h.receive()
    const text = h.fake.replies.at(-1)!.text
    return /#t=([^\s)]+)/.exec(text)![1]
  }

  function post(body: unknown, origin: string | null = "https://firstmove.energy") {
    const headers: Record<string, string> = { "content-type": "application/json" }
    if (origin) headers.origin = origin
    return new Request("https://firstmove.energy/api/mail/confirm", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body), headers })
  }

  const sid = () => senderId(h.deps.config.secrets.hash, "jane@example.org")

  beforeEach(() => {
    lines = []
    vi.spyOn(console, "info").mockImplementation((line: string) => void lines.push(line))
    h = pipelineHarness()
    started = []
    deps = {
      env: { status: "ready", config: h.deps.config },
      store: () => h.store,
      start: async (input) => void started.push(input),
      versions: { terms: "1.1", privacy: "1.1" },
      now: h.clock.now,
    }
  })

  it("records consent with the legal versions and starts the waiting emails, oldest first", async () => {
    const token = await asked()
    h.clock.now += 60_000
    await h.receive()
    await h.receive()
    const response = await handleConfirm(post({ token }), { ...deps, now: h.clock.now })
    expect(response.status).toBe(CONFIRM_STATUS.confirmed)
    expect(JSON.parse((await h.store.get(keys.consent(await sid())))!)).toEqual({ at: new Date(h.clock.now).toISOString(), terms: "1.1", privacy: "1.1" })
    expect(started.map((input) => input.emailId)).toEqual(["email-1", "email-2", "email-3"])
    expect(started.every((input) => input.origin === "consent" && input.inboxId === "inbox-agent")).toBe(true)
    expect(await pendingOf(h.store, h.deps.config.secrets.state, await sid(), h.clock.now)).toEqual([])
  })

  it("lets a started run go past consent to the guard", async () => {
    const token = await asked()
    await handleConfirm(post({ token }), deps)
    expect(await inboundFlow(h.steps, started[0], h.clock.now)).toBe("allow")
  })

  it("works once: the same link again is used", async () => {
    const token = await asked()
    expect((await handleConfirm(post({ token }), deps)).status).toBe(200)
    expect((await handleConfirm(post({ token }), deps)).status).toBe(CONFIRM_STATUS.used)
    expect(started).toHaveLength(1)
  })

  it("refuses a tampered, malformed or oversized token, and an expired one", async () => {
    const token = await asked()
    const tampered = token.replace(/\.(\d+)\./, (_, exp: string) => `.${Number(exp) + 1}.`)
    const statuses = [
      (await handleConfirm(post({ token: tampered }), deps)).status,
      (await handleConfirm(post({ token: "v1.short" }), deps)).status,
      (await handleConfirm(post("not json"), deps)).status,
      (await handleConfirm(post({ token: "x".repeat(2000) }), deps)).status,
      (await handleConfirm(post({ token }), { ...deps, now: h.clock.now + 8 * DAY })).status,
    ]
    expect(statuses).toEqual([400, 400, 400, 400, CONFIRM_STATUS.expired])
    expect(started).toEqual([])
    expect((await handleConfirm(post({ token }), deps)).status).toBe(200)
  })

  it("refuses a token that is valid but was never issued", async () => {
    const secret = h.deps.config.secrets.confirm
    const token = await confirmToken(secret, await tokenIdFor(secret, "email-never"), Math.floor(h.clock.now / 1000) + DAY / 1000)
    expect((await handleConfirm(post({ token }), deps)).status).toBe(CONFIRM_STATUS.used)
  })

  it("only counts a POST from our own site, so a link scanner confirms nothing", async () => {
    const token = await asked()
    expect((await handleConfirm(post({ token }, null), deps)).status).toBe(CONFIRM_STATUS.forbidden)
    expect((await handleConfirm(post({ token }, "https://evil.example"), deps)).status).toBe(CONFIRM_STATUS.forbidden)
    expect(started).toEqual([])
    expect((await handleConfirm(post({ token }), deps)).status).toBe(200)
  })

  it("does not exist without a configuration, and waits while switched off", async () => {
    const token = await asked()
    const incomplete: MailAgentEnv = { status: "incomplete", enabled: false, missing: ["RESEND_API_KEY"], invalid: [] }
    expect((await handleConfirm(post({ token }), { ...deps, env: incomplete })).status).toBe(404)
    expect((await handleConfirm(post({ token }), { ...deps, env: { status: "disabled", config: h.deps.config } })).status).toBe(503)
    expect(started).toEqual([])
    expect((await handleConfirm(post({ token }), deps)).status).toBe(200)
  })

  it("restores the link when a start fails; emails that started no longer wait", async () => {
    const token = await asked()
    await h.receive()
    let calls = 0
    const flaky = { ...deps, start: async (input: InboundInput) => (++calls === 2 ? Promise.reject(new Error("queue down")) : void started.push(input)) }
    expect((await handleConfirm(post({ token }), flaky)).status).toBe(CONFIRM_STATUS.error)
    expect(started.map((input) => input.emailId)).toEqual(["email-1"])
    expect((await pendingOf(h.store, h.deps.config.secrets.state, await sid(), h.clock.now)).map((ref) => ref.emailId)).toEqual(["email-2"])
    expect((await handleConfirm(post({ token }), deps)).status).toBe(200)
    expect(started.map((input) => input.emailId)).toEqual(["email-1", "email-2"])
  })

  it("restores the link while another email of the sender holds the lock", async () => {
    const token = await asked()
    await h.store.set(keys.lock(await sid()), "other-run", { ttlMs: 60_000 })
    expect((await handleConfirm(post({ token }), deps)).status).toBe(CONFIRM_STATUS.unavailable)
    expect(started).toEqual([])
    await h.store.del(keys.lock(await sid()))
    expect((await handleConfirm(post({ token }), deps)).status).toBe(200)
  })

  it("logs codes and a sender prefix only", async () => {
    const token = await asked()
    lines.length = 0
    await handleConfirm(post({ token }), deps)
    const line = JSON.parse(lines[0])
    expect(line).toEqual({ scope: "mail-agent", event: "confirm", result: "confirmed", sid: (await sid()).slice(0, 8), started: 1 })
  })
})

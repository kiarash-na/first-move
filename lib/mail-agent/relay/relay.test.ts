// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { testConfig, testEmail } from "../gates/test-utils/context"
import { fakeTransport } from "../inbound/test-utils/fake-transport"
import type { InboundEmail } from "../inbound/transport"
import { keys } from "../store/keys"
import { createMemoryStore } from "../store/memory-store"
import { RELAY_PER_DAY, relayToPerson } from "./relay"

const NOW = Date.UTC(2026, 9, 25, 9)

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {})
  vi.spyOn(console, "log").mockImplementation(() => {})
})
afterEach(() => vi.restoreAllMocks())

function setup(overrides: Partial<InboundEmail> = {}) {
  const fake = fakeTransport()
  const store = createMemoryStore({ now: () => NOW })
  const email = testEmail({ id: "h1", to: ["human@mail.firstmove.energy"], subject: "Data request", text: "Please delete my data.", ...overrides })
  fake.emails[email.id] = email
  const deps = { config: testConfig(), store, transport: fake.transport }
  const relay = (id = "h1", inboxId = "inbox-human") => relayToPerson(deps, { emailId: id, threadId: `t-${id}`, inboxId }, NOW)
  return { fake, store, relay }
}

describe("relayToPerson (O8)", () => {
  it("passes an email to human@ on to the person, once, with the sender as Reply-To", async () => {
    const { fake, store, relay } = setup()
    expect(await relay()).toBe("relayed")
    expect(fake.forwarded).toHaveLength(1)
    expect(fake.forwarded[0]).toMatchObject({
      emailId: "h1",
      from: '"First Move" <human@mail.firstmove.energy>',
      to: "owner@example.org",
      replyTo: "jane@example.org",
      subject: "Mail to human@mail.firstmove.energy: Data request",
      headers: { "Auto-Submitted": "auto-generated" },
      idempotencyKey: "relay/h1",
    })
    expect(fake.forwarded[0].text).toContain("From: jane@example.org")
    expect(fake.forwarded[0].text).toContain("Reply to this email to answer the sender.")
    expect(await store.get(keys.done("h1"))).toBe("relayed")
    expect(await relay()).toBe("done")
    expect(fake.forwarded).toHaveLength(1)
  })

  it("sets no Reply-To when DMARC did not pass, and says so", async () => {
    const { fake, relay } = setup({ authentication: { spf: "pass", dkim: "fail", dmarc: "fail" } })
    expect(await relay()).toBe("relayed-unverified")
    expect(fake.forwarded[0].replyTo).toBeUndefined()
    expect(fake.forwarded[0].text).toContain("could not be verified")
  })

  it("leaves machine mail, our own mail and the person's own mail in the inbox", async () => {
    for (const overrides of [{ headers: { "auto-submitted": "auto-replied" } }, { from: "agent@mail.firstmove.energy" }, { from: "human@mail.firstmove.energy" }, { from: "owner@example.org" }]) {
      const { fake, relay } = setup(overrides)
      expect(await relay()).toBe("loop")
      expect(fake.forwarded).toEqual([])
    }
  })

  it("touches nothing of another inbox", async () => {
    const { fake, relay } = setup()
    expect(await relay("h1", "inbox-agent")).toBe("other-inbox")
    expect(await relay("h2", "inbox-unknown")).toBe("other-inbox")
    expect(fake.forwarded).toEqual([])
  })

  it("stops at the daily cap with one note to the person", async () => {
    const { fake, store, relay } = setup()
    await store.incr(keys.relay("2026-10-25"), 86_400_000, RELAY_PER_DAY)
    expect(await relay()).toBe("relay-full")
    expect(fake.sent).toHaveLength(1)
    expect(fake.sent[0]).toMatchObject({ to: "owner@example.org", idempotencyKey: "relay/more/2026-10-25" })
    fake.emails.h2 = { ...fake.emails.h1, id: "h2" }
    expect(await relay("h2")).toBe("relay-full")
    expect(fake.sent).toHaveLength(1)
  })
})

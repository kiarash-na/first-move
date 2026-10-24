import { describe, expect, it } from "vitest"
import { parseEvent } from "./event"

const data = { source: "system", inbox_id: "inbox-1", thread_id: "thread-1", email_id: "email-0a06", email: { direction: "inbound", subject: "Hi" } }

describe("parseEvent", () => {
  it("reads an inbox email event as ids only", () => {
    expect(parseEvent({ type: "inbox.email.received", created_at: "2026-10-24T18:28:04Z", data })).toEqual({
      kind: "inbound",
      ref: { emailId: "email-0a06", threadId: "thread-1", inboxId: "inbox-1" },
      direction: "inbound",
    })
  })

  it("ignores other event types, also the domain-wide email.received", () => {
    expect(parseEvent({ type: "email.received", data: { email_id: "x" } })).toEqual({ kind: "ignored", reason: "type" })
    expect(parseEvent({ type: "inbox.email.sent", data })).toEqual({ kind: "ignored", reason: "type" })
  })

  it("rejects malformed events and ids that could reach a key or a path", () => {
    expect(parseEvent(null)).toEqual({ kind: "invalid" })
    expect(parseEvent({ type: "inbox.email.received", data: { ...data, email_id: "../../emails" } })).toEqual({ kind: "invalid" })
    expect(parseEvent({ type: "inbox.email.received", data: { inbox_id: "a" } })).toEqual({ kind: "invalid" })
  })
})

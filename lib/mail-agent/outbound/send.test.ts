// @vitest-environment node
import { describe, expect, it } from "vitest"
import { testConfig, testEmail } from "../gates/test-utils/context"
import { fakeTransport } from "../inbound/test-utils/fake-transport"
import { AI_HEADERS, replySubject, repliesInThread, sendReply } from "./send"

const thread = { inboxId: "inbox-agent", threadId: "thread-1" }
const reply = { kind: "warning", text: "Hello" }

describe("repliesInThread", () => {
  it("only when no Reply-To could redirect the answer", () => {
    expect(repliesInThread({ from: "jane@example.org", replyTo: [] })).toBe(true)
    expect(repliesInThread({ from: "jane@example.org", replyTo: ["jane+list@example.org"] })).toBe(true)
    expect(repliesInThread({ from: "j.ane@gmail.com", replyTo: ["jane@googlemail.com"] })).toBe(true)
    expect(repliesInThread({ from: "jane@example.org", replyTo: ["victim@example.com"] })).toBe(false)
    expect(repliesInThread({ from: "jane@example.org", replyTo: ["jane@example.org", "victim@example.com"] })).toBe(false)
  })
})

describe("sendReply", () => {
  it("answers in the thread, marked as automatic and AI, once per kind", async () => {
    const fake = fakeTransport()
    const email = testEmail()
    await sendReply(fake.transport, testConfig(), email, thread, reply)
    await sendReply(fake.transport, testConfig(), email, thread, reply)
    expect(fake.sent).toEqual([])
    expect(fake.replies).toEqual([
      { inboxId: "inbox-agent", threadId: "thread-1", emailId: "email-1", text: "Hello", headers: AI_HEADERS, idempotencyKey: "reply/email-1/warning" },
    ])
  })

  it("writes a new email to the From address when the Reply-To points elsewhere", async () => {
    const fake = fakeTransport()
    await sendReply(fake.transport, testConfig(), testEmail({ replyTo: ["victim@example.com"], subject: "Quick Check" }), thread, reply)
    expect(fake.replies).toEqual([])
    expect(fake.sent).toEqual([
      {
        from: '"First Move assistant (AI)" <agent@mail.firstmove.energy>',
        to: "jane@example.org",
        subject: "Re: Quick Check",
        text: "Hello",
        headers: { ...AI_HEADERS, "In-Reply-To": "<m1@example.org>", References: "<m1@example.org>" },
        idempotencyKey: "reply/email-1/warning",
      },
    ])
    expect(JSON.stringify(fake.sent)).not.toContain("victim")
  })

  it("leaves out threading headers it cannot repeat safely", async () => {
    const fake = fakeTransport()
    await sendReply(fake.transport, testConfig(), testEmail({ replyTo: ["x@example.com"], messageId: "<a b>\r\nBcc: x@example.com" }), thread, reply)
    expect(fake.sent[0].headers).toEqual(AI_HEADERS)
  })
})

describe("replySubject", () => {
  it("keeps one Re: on one line", () => {
    expect(replySubject("Quick Check")).toBe("Re: Quick Check")
    expect(replySubject("RE: Quick Check")).toBe("RE: Quick Check")
    expect(replySubject("Line\r\nBcc: x@example.com")).toBe("Re: Line Bcc: x@example.com")
    expect(replySubject("")).toBe("Re: First Move")
    expect(replySubject("x".repeat(500)).length).toBeLessThanOrEqual(204)
  })
})

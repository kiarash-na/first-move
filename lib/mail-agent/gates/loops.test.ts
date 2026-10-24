// @vitest-environment node
import { describe, expect, it } from "vitest"
import { loopGate } from "./loops"
import { testContext, testEmail } from "./test-utils/context"

describe("loopGate", () => {
  it.each([
    ["an auto-reply", { "auto-submitted": "auto-replied" }],
    ["bulk mail", { precedence: "bulk" }],
    ["a mailing list", { "list-id": "<news.example.org>" }],
    ["an unsubscribe header", { "list-unsubscribe": "<mailto:x@example.org>" }],
    ["an X-Autoreply", { "x-autoreply": "yes" }],
    ["a bounce", { "return-path": "<>" }],
  ])("drop %s", (_, headers) => {
    expect(loopGate(testContext({ email: testEmail({ headers }) }))).toEqual({ ok: false, reason: "loop" })
  })

  it("keep Auto-Submitted: no", () => {
    expect(loopGate(testContext({ email: testEmail({ headers: { "auto-submitted": "no" } }) }))).toEqual({ ok: true })
  })

  it.each(["mailer-daemon@example.org", "postmaster@example.org", "no-reply@example.org", "noreply+x@example.org", "donotreply@example.org", "agent@mail.firstmove.energy", "Human@Mail.FirstMove.Energy"])(
    "drop mail from %s",
    (from) => {
      expect(loopGate(testContext({ email: testEmail({ from: from.toLowerCase() }) }))).toEqual({ ok: false, reason: "loop" })
    },
  )

  it("let the admin address write to the agent", () => {
    expect(loopGate(testContext({ email: testEmail({ from: "owner@example.org" }) }))).toEqual({ ok: true })
  })
})

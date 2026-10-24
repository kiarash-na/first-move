// @vitest-environment node
import { Resend } from "resend"
import { Webhook } from "svix"
import { describe, expect, it } from "vitest"
import { verifyWebhook } from "./verify"

const secret = `whsec_${Buffer.alloc(24, 9).toString("base64")}`
const resend = new Resend("re_test_only")
// The signature library checks the timestamp against the real clock, so tests sign at the current time.
const now = Date.now()
const body = JSON.stringify({ type: "inbox.email.received", data: { email_id: "e1" } })

function signed(payload: string, at = now, msgId = "msg_1", key = secret) {
  const timestamp = new Date(at)
  const signature = new Webhook(key).sign(msgId, timestamp, payload)
  return new Headers({ "svix-id": msgId, "svix-timestamp": String(Math.floor(at / 1000)), "svix-signature": signature })
}

describe("verifyWebhook", () => {
  it("accepts a valid signature and returns the payload and id", () => {
    expect(verifyWebhook(resend, body, signed(body), secret, now)).toEqual({ ok: true, payload: JSON.parse(body), svixId: "msg_1" })
  })

  it("refuses a changed body, another secret, and missing headers", () => {
    expect(verifyWebhook(resend, body.replace("e1", "e2"), signed(body), secret, now)).toEqual({ ok: false })
    expect(verifyWebhook(resend, body, signed(body, now, "msg_1", `whsec_${Buffer.alloc(24, 1).toString("base64")}`), secret, now)).toEqual({ ok: false })
    const headers = signed(body)
    headers.delete("svix-signature")
    expect(verifyWebhook(resend, body, headers, secret, now)).toEqual({ ok: false })
  })

  it("refuses timestamps more than five minutes off, both ways", () => {
    expect(verifyWebhook(resend, body, signed(body, now - 301_000), secret, now)).toEqual({ ok: false })
    expect(verifyWebhook(resend, body, signed(body, now + 301_000), secret, now)).toEqual({ ok: false })
    expect(verifyWebhook(resend, body, signed(body, now - 299_000), secret, now).ok).toBe(true)
  })

  it("refuses a message id that could not be a store key", () => {
    expect(verifyWebhook(resend, body, signed(body, now, "msg 1/../x"), secret, now)).toEqual({ ok: false })
  })

  it("refuses a malformed timestamp", () => {
    const headers = signed(body)
    headers.set("svix-timestamp", "soon")
    expect(verifyWebhook(resend, body, headers, secret, now)).toEqual({ ok: false })
  })
})

import { afterEach, describe, expect, it, vi } from "vitest"
import { ALREADY_SENT, resendTransport, toInboundEmail, TransportError } from "./transport"

/** The shape the receiving API returned for the phase A06 spike email (values shortened). */
const RECEIVED = {
  object: "email",
  id: "00000000-0000-4000-8000-000000000a06",
  to: ["agent@mail.firstmove.energy"],
  from: "First Move spike <Spike@Mail.FirstMove.Energy>",
  created_at: "2026-10-24T18:28:04.072Z",
  subject: "A06 spike: inbound check",
  reply_to: [],
  received_for: ["agent@mail.firstmove.energy"],
  html: null,
  text: "Spike for phase A06: checking the inbound payload. 120 buildings, 12 ha.",
  headers: { "Content-Type": "multipart/mixed", Received: ["from a", "from b"], "X-SES-Outgoing": "2026.10.24" },
  message_id: "<0000000000000a06@eu-west-1.amazonses.com>",
  authentication: { spf: "pass", dkim: "pass", dmarc: "pass" },
  attachments: [{ id: "8f26266a", filename: "buildings.csv", size: 27, content_type: "text/csv", content_id: null, content_disposition: "attachment" }],
}

describe("toInboundEmail", () => {
  it("keeps what the agent needs, with the authenticated address and lower-case headers", () => {
    expect(toInboundEmail(RECEIVED)).toEqual({
      id: RECEIVED.id,
      from: "spike@mail.firstmove.energy",
      to: ["agent@mail.firstmove.energy"],
      replyTo: [],
      subject: "A06 spike: inbound check",
      text: RECEIVED.text,
      headers: { "content-type": "multipart/mixed", received: "from a\nfrom b", "x-ses-outgoing": "2026.10.24" },
      messageId: RECEIVED.message_id,
      authentication: { spf: "pass", dkim: "pass", dmarc: "pass" },
      attachments: [{ id: "8f26266a", name: "buildings.csv", size: 27, contentType: "text/csv", inline: false }],
    })
  })

  it("reads HTML-only mail as text and treats missing or unknown results as unknown", () => {
    const email = toInboundEmail({ ...RECEIVED, text: null, html: "<p>Hi <b>there</b></p>", authentication: { dmarc: "temperror" } })
    expect(email?.text).toBe("Hi there")
    expect(email?.authentication).toEqual({ spf: "unknown", dkim: "unknown", dmarc: "unknown" })
    expect(toInboundEmail({ ...RECEIVED, authentication: undefined })?.authentication.dmarc).toBe("unknown")
  })

  it("gives no address for a From that is none, and null for a malformed response", () => {
    expect(toInboundEmail({ ...RECEIVED, from: "MAILER-DAEMON" })?.from).toBeNull()
    expect(toInboundEmail({ id: 1 })).toBeNull()
  })
})

/** Stubs `fetch` for the Resend SDK; each answer is a status and a JSON body. */
function fakeResend(...answers: [status: number, body: unknown][]) {
  const calls: { url: string; init: RequestInit }[] = []
  vi.spyOn(console, "error").mockImplementation(() => {})
  vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
    calls.push({ url: String(url), init })
    const [status, body] = answers[Math.min(calls.length, answers.length) - 1]
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })
  })
  return calls
}

const reply = { inboxId: "inbox-agent", threadId: "t1", emailId: "e1", text: "Hello", headers: { "X-First-Move-AI": "generated" }, idempotencyKey: "reply/e1/warning" }
const email = { from: "agent@mail.firstmove.energy", to: "jane@example.org", subject: "Re: Hi", text: "Hello", headers: {}, idempotencyKey: "reply/e1/warning" }

describe("resendTransport", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("fetches a received email with its authentication results", async () => {
    const calls = fakeResend([200, RECEIVED])
    const fetched = await resendTransport("re_test").getEmail(RECEIVED.id)
    expect(fetched?.authentication.dmarc).toBe("pass")
    expect(calls[0].url).toContain(`/emails/receiving/${RECEIVED.id}`)
    expect(calls[0].url).toContain("html_format=cid")
  })

  it("gives null for an unknown email and a retryable error for a server error", async () => {
    fakeResend([404, { name: "not_found", message: "Email not found", statusCode: 404 }])
    expect(await resendTransport("re_test").getEmail("missing")).toBeNull()
    fakeResend([500, { name: "internal_server_error", message: "x", statusCode: 500 }])
    await expect(resendTransport("re_test").getEmail("e1")).rejects.toMatchObject({ code: "internal_server_error", retryable: true })
  })

  it("replies in the thread to the sender only, with the idempotency key", async () => {
    const calls = fakeResend([200, { id: "sent-1" }])
    expect(await resendTransport("re_test").replyInThread(reply)).toBe("sent-1")
    expect(calls[0].url).toContain("/inboxes/inbox-agent/threads/t1/emails/e1/reply")
    expect(JSON.parse(String(calls[0].init.body))).toMatchObject({ text: "Hello", reply_all: false, headers: reply.headers })
    expect(new Headers(calls[0].init.headers).get("Idempotency-Key")).toBe("reply/e1/warning")
  })

  it("counts a key used before with another body as sent", async () => {
    fakeResend([409, { name: "invalid_idempotent_request", message: "x", statusCode: 409 }])
    expect(await resendTransport("re_test").replyInThread(reply)).toBe(ALREADY_SENT)
    fakeResend([409, { name: "invalid_idempotent_request", message: "x", statusCode: 409 }])
    expect(await resendTransport("re_test").send(email)).toBe(ALREADY_SENT)
  })

  it("downloads an attachment within the size cap, and refuses a larger one", async () => {
    const calls: string[] = []
    vi.stubGlobal("fetch", async (url: string) => {
      calls.push(String(url))
      if (String(url).startsWith("https://files.example/")) return new Response(new Uint8Array([1, 2, 3, 4]), { status: 200 })
      return Response.json({ object: "attachment", id: "a1", size: 4, content_type: "text/csv", download_url: "https://files.example/a1" })
    })
    expect(await resendTransport("re_test").getAttachment("e1", "a1", 10)).toEqual(new Uint8Array([1, 2, 3, 4]))
    expect(calls[0]).toContain("/emails/receiving/e1/attachments/a1")
    expect(await resendTransport("re_test").getAttachment("e1", "a1", 3)).toBeNull()
  })

  it("forwards a received email to our own address with the original attached", async () => {
    const posts: unknown[] = []
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      if (String(url).startsWith("https://files.example/")) return new Response("Subject: Hi\r\n\r\nHello", { status: 200 })
      if (init?.method === "POST") {
        posts.push(JSON.parse(String(init.body)))
        return Response.json({ id: "fwd-1" })
      }
      return Response.json({ ...RECEIVED, raw: { download_url: "https://files.example/raw" } })
    })
    const id = await resendTransport("re_test").forward({ emailId: "e1", from: "human@mail.firstmove.energy", to: "owner@example.org", subject: "Fwd: Hi", text: "Cover", replyTo: "jane@example.org", headers: {}, idempotencyKey: "relay/e1" })
    expect(id).toBe("fwd-1")
    expect(posts[0]).toMatchObject({
      to: ["owner@example.org"],
      reply_to: "jane@example.org",
      attachments: [{ filename: "original.eml", content_type: "message/rfc822", content: Buffer.from("Subject: Hi\r\n\r\nHello").toString("base64") }],
    })
  })

  it("marks signature images as inline", () => {
    const email = toInboundEmail({ ...RECEIVED, attachments: [{ id: "i1", filename: "logo.png", size: 900, content_type: "image/png", content_id: "logo@x", content_disposition: "inline" }] })
    expect(email?.attachments[0].inline).toBe(true)
  })

  it("tells retryable failures from final ones", async () => {
    fakeResend([429, { name: "rate_limit_exceeded", message: "x", statusCode: 429 }])
    await expect(resendTransport("re_test").send(email)).rejects.toMatchObject({ retryable: true })
    fakeResend([422, { name: "validation_error", message: "x", statusCode: 422 }])
    const failure = await resendTransport("re_test").send(email).catch((error: unknown) => error)
    expect(failure).toBeInstanceOf(TransportError)
    expect(failure).toMatchObject({ code: "validation_error", retryable: false })
  })
})

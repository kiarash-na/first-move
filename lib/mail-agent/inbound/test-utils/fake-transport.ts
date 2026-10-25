import { ALREADY_SENT, TransportError, type ForwardedEmail, type InboundEmail, type MailTransport, type NewEmail, type ThreadReply } from "../transport"

/**
 * A Resend stand-in for tests: serves the given emails and attachment bytes, and records what was
 * sent and forwarded. Like Resend, a repeated idempotency key sends nothing new, and with another
 * body it answers as already sent.
 */
export function fakeTransport(emails: Record<string, InboundEmail> = {}, inboxes: Record<string, string> = { "inbox-agent": "agent@mail.firstmove.energy", "inbox-human": "human@mail.firstmove.energy" }) {
  const replies: ThreadReply[] = []
  const sent: NewEmail[] = []
  const forwarded: ForwardedEmail[] = []
  /** Attachment bytes by `${emailId}/${attachmentId}`. */
  const files: Record<string, Uint8Array> = {}
  const bodies = new Map<string, string>()
  const failures: { method: keyof MailTransport; code: string }[] = []

  function deliver<T extends ThreadReply | NewEmail | ForwardedEmail>(list: T[], message: T, prefix: string): string {
    const body = JSON.stringify(message)
    const known = bodies.get(message.idempotencyKey)
    if (known !== undefined) return known === body ? `${prefix}-${message.idempotencyKey}` : ALREADY_SENT
    bodies.set(message.idempotencyKey, body)
    list.push(message)
    return `${prefix}-${message.idempotencyKey}`
  }

  function failIfAsked(method: keyof MailTransport) {
    const index = failures.findIndex((failure) => failure.method === method)
    if (index >= 0) throw new TransportError(failures.splice(index, 1)[0].code)
  }

  const transport: MailTransport = {
    async getEmail(id) {
      failIfAsked("getEmail")
      return emails[id] ?? null
    },
    async getAttachment(emailId, attachmentId, maxBytes) {
      failIfAsked("getAttachment")
      const bytes = files[`${emailId}/${attachmentId}`]
      return bytes && bytes.byteLength <= maxBytes ? bytes : null
    },
    async replyInThread(reply) {
      failIfAsked("replyInThread")
      return deliver(replies, reply, "reply")
    },
    async send(email) {
      failIfAsked("send")
      return deliver(sent, email, "sent")
    },
    async forward(email) {
      failIfAsked("forward")
      return deliver(forwarded, email, "forward")
    },
    async inboxAddress(inboxId) {
      failIfAsked("inboxAddress")
      return inboxes[inboxId] ?? null
    },
  }

  /** Makes the next call of `method` fail once with Resend's error `code`. */
  const failNext = (method: keyof MailTransport, code = "internal_server_error") => failures.push({ method, code })

  return { transport, emails, files, replies, sent, forwarded, failNext }
}

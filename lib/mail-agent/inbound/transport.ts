import "server-only"
import { Resend } from "resend"
import { z } from "zod"
import { emailAddress } from "../store/sender-id"
import { htmlToText } from "../text/html-to-text"

export type AuthResult = "pass" | "fail" | "gray" | "processing_failed" | "unknown"

/** A received email, held in memory for one step only, never passed between steps or logged. */
export interface InboundEmail {
  id: string
  /** The authenticated From address, lower case; null when it is not an address. */
  from: string | null
  replyTo: string[]
  subject: string
  /** The plain-text part, or the HTML part as text. */
  text: string
  /** Header names lower case; repeated headers joined with a line break. */
  headers: Record<string, string>
  messageId: string | null
  /** The receiving server's results, not headers a sender could write. */
  authentication: { spf: AuthResult; dkim: AuthResult; dmarc: AuthResult }
  attachments: { id: string; name: string | null; size: number; contentType: string | null }[]
}

export interface OutboundHeaders {
  [name: string]: string
}

export interface ThreadReply {
  inboxId: string
  threadId: string
  emailId: string
  text: string
  html?: string
  headers: OutboundHeaders
  idempotencyKey: string
}

export interface NewEmail {
  from: string
  to: string
  subject: string
  text: string
  html?: string
  headers: OutboundHeaders
  idempotencyKey: string
}

/** What the email agent needs from Resend; tests pass a fake. */
export interface MailTransport {
  getEmail(emailId: string): Promise<InboundEmail | null>
  replyInThread(reply: ThreadReply): Promise<string>
  send(email: NewEmail): Promise<string>
}

const AUTH = z.enum(["pass", "fail", "gray", "processing_failed", "unknown"]).catch("unknown")

/** The receiving API's shape, checked: the SDK types omit `authentication`, which the API returns. */
const RECEIVED = z.object({
  id: z.string(),
  from: z.string(),
  reply_to: z.array(z.string()).nullish(),
  subject: z.string().nullish(),
  text: z.string().nullish(),
  html: z.string().nullish(),
  headers: z.record(z.string(), z.union([z.string(), z.array(z.string())])).nullish(),
  message_id: z.string().nullish(),
  authentication: z.object({ spf: AUTH, dkim: AUTH, dmarc: AUTH }).partial().nullish(),
  attachments: z
    .array(z.object({ id: z.string(), filename: z.string().nullish(), size: z.number(), content_type: z.string().nullish() }))
    .nullish(),
})

export function toInboundEmail(raw: unknown): InboundEmail | null {
  const parsed = RECEIVED.safeParse(raw)
  if (!parsed.success) return null
  const email = parsed.data
  const headers = Object.fromEntries(
    Object.entries(email.headers ?? {}).map(([name, value]) => [name.toLowerCase(), Array.isArray(value) ? value.join("\n") : value]),
  )
  return {
    id: email.id,
    from: emailAddress(email.from),
    replyTo: (email.reply_to ?? []).map((entry) => emailAddress(entry) ?? entry.trim().toLowerCase()),
    subject: email.subject ?? "",
    text: email.text ?? (email.html ? htmlToText(email.html) : ""),
    headers,
    messageId: email.message_id ?? null,
    authentication: {
      spf: email.authentication?.spf ?? "unknown",
      dkim: email.authentication?.dkim ?? "unknown",
      dmarc: email.authentication?.dmarc ?? "unknown",
    },
    attachments: (email.attachments ?? []).map((file) => ({ id: file.id, name: file.filename ?? null, size: file.size, contentType: file.content_type ?? null })),
  }
}

/** Failures that may pass on a later attempt; anything else (validation, quota, keys) will not. */
const RETRYABLE = new Set(["rate_limit_exceeded", "concurrent_idempotent_requests", "application_error", "internal_server_error", "empty"])

/** A failure Resend reports, by code. A step retries the retryable ones and gives up on the rest. */
export class TransportError extends Error {
  readonly retryable: boolean

  constructor(readonly code: string) {
    super(`Resend request failed: ${code}`)
    this.name = "TransportError"
    this.retryable = RETRYABLE.has(code)
  }
}

/**
 * The idempotency key was used before with another body: a retried step whose earlier attempt
 * already sent the email. Counts as sent.
 */
export const ALREADY_SENT = "already-sent"

/** The transport on the Resend Node SDK (receiving, inbox replies, sending). */
export function resendTransport(apiKey: string): MailTransport {
  const resend = new Resend(apiKey)
  return {
    async getEmail(emailId) {
      const { data, error } = await resend.emails.receiving.get(emailId, { html_format: "cid" })
      if (error) {
        if (error.name === "not_found") return null
        throw new TransportError(error.name)
      }
      return toInboundEmail(data)
    },
    async replyInThread({ inboxId, threadId, emailId, text, html, headers, idempotencyKey }) {
      const { data, error } = await resend.inboxes.threads.emails.reply(
        { inboxId, threadId, emailId, text, ...(html && { html }), headers, replyAll: false },
        { idempotencyKey },
      )
      if (error?.name === "invalid_idempotent_request") return ALREADY_SENT
      if (error || !data) throw new TransportError(error?.name ?? "empty")
      return data.id
    },
    async send({ from, to, subject, text, html, headers, idempotencyKey }) {
      const { data, error } = await resend.emails.send({ from, to: [to], subject, text, ...(html && { html }), headers }, { idempotencyKey })
      if (error?.name === "invalid_idempotent_request") return ALREADY_SENT
      if (error || !data) throw new TransportError(error?.name ?? "empty")
      return data.id
    },
  }
}

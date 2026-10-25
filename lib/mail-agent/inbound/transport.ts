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
  /** The recipients the message was addressed to, lower case. */
  to: string[]
  replyTo: string[]
  subject: string
  /** The plain-text part, or the HTML part as text. */
  text: string
  /** Header names lower case; repeated headers joined with a line break. */
  headers: Record<string, string>
  messageId: string | null
  /** The receiving server's results, not headers a sender could write. */
  authentication: { spf: AuthResult; dkim: AuthResult; dmarc: AuthResult }
  /** `inline`: an image the body shows (a signature logo), not a file the sender attached. */
  attachments: { id: string; name: string | null; size: number; contentType: string | null; inline: boolean }[]
}

export interface OutboundHeaders {
  [name: string]: string
}

/** A file sent with an email, base64. */
export interface OutboundAttachment {
  filename: string
  content: string
  contentType: string
}

export interface ThreadReply {
  inboxId: string
  threadId: string
  emailId: string
  text: string
  html?: string
  attachments?: OutboundAttachment[]
  headers: OutboundHeaders
  idempotencyKey: string
}

export interface NewEmail {
  from: string
  to: string
  subject: string
  text: string
  html?: string
  attachments?: OutboundAttachment[]
  /** Only on mail to the operator (a relayed email), never on a reply to a sender. */
  replyTo?: string
  headers: OutboundHeaders
  idempotencyKey: string
}

/** A received email passed on to one of our own addresses, with the original attached as `.eml`. */
export interface ForwardedEmail extends Omit<NewEmail, "attachments"> {
  emailId: string
}

/** What the email agent needs from Resend; tests pass a fake. */
export interface MailTransport {
  getEmail(emailId: string): Promise<InboundEmail | null>
  /** An attachment's bytes, or null when it is gone or larger than `maxBytes`. */
  getAttachment(emailId: string, attachmentId: string, maxBytes: number): Promise<Uint8Array | null>
  replyInThread(reply: ThreadReply): Promise<string>
  send(email: NewEmail): Promise<string>
  /** Sends a new email with the received one attached as `message/rfc822`, or without it when it is too large. */
  forward(email: ForwardedEmail): Promise<string>
  /** The address of a Resend inbox, or null when there is none with this id. */
  inboxAddress(inboxId: string): Promise<string | null>
}

const AUTH = z.enum(["pass", "fail", "gray", "processing_failed", "unknown"]).catch("unknown")

/** The receiving API's shape, checked: the SDK types omit `authentication`, which the API returns. */
const RECEIVED = z.object({
  id: z.string(),
  from: z.string(),
  to: z.array(z.string()).nullish(),
  reply_to: z.array(z.string()).nullish(),
  subject: z.string().nullish(),
  text: z.string().nullish(),
  html: z.string().nullish(),
  headers: z.record(z.string(), z.union([z.string(), z.array(z.string())])).nullish(),
  message_id: z.string().nullish(),
  authentication: z.object({ spf: AUTH, dkim: AUTH, dmarc: AUTH }).partial().nullish(),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        filename: z.string().nullish(),
        size: z.number(),
        content_type: z.string().nullish(),
        content_id: z.string().nullish(),
        content_disposition: z.string().nullish(),
      }),
    )
    .nullish(),
})

const isInline = (file: { content_type?: string | null; content_id?: string | null; content_disposition?: string | null }) =>
  file.content_disposition?.toLowerCase() === "inline" || Boolean(file.content_id && file.content_type?.toLowerCase().startsWith("image/"))

export function toInboundEmail(raw: unknown): InboundEmail | null {
  const parsed = RECEIVED.safeParse(raw)
  if (!parsed.success) return null
  const email = parsed.data
  const headers = Object.fromEntries(
    Object.entries(email.headers ?? {}).map(([name, value]) => [name.toLowerCase(), Array.isArray(value) ? value.join("\n") : value]),
  )
  const address = (entry: string) => emailAddress(entry) ?? entry.trim().toLowerCase()
  return {
    id: email.id,
    from: emailAddress(email.from),
    to: (email.to ?? []).map(address),
    replyTo: (email.reply_to ?? []).map(address),
    subject: email.subject ?? "",
    text: email.text ?? (email.html ? htmlToText(email.html) : ""),
    headers,
    messageId: email.message_id ?? null,
    authentication: {
      spf: email.authentication?.spf ?? "unknown",
      dkim: email.authentication?.dkim ?? "unknown",
      dmarc: email.authentication?.dmarc ?? "unknown",
    },
    attachments: (email.attachments ?? []).map((file) => ({
      id: file.id,
      name: file.filename ?? null,
      size: file.size,
      contentType: file.content_type ?? null,
      inline: isInline(file),
    })),
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

/** The original of a forwarded email is attached up to this size; above it, only the cover goes out. */
export const MAX_FORWARD_BYTES = 15 * 1024 * 1024
const DOWNLOAD_TIMEOUT_MS = 30_000

/**
 * Downloads a file Resend serves from a signed URL (attachments, raw messages), reading at most
 * `maxBytes`: null when it is gone, larger, or the download fails.
 */
export async function download(url: string, maxBytes: number): Promise<Uint8Array | null> {
  let response: Response
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) })
  } catch {
    return null
  }
  if (!response.ok || !response.body) return null
  if (Number(response.headers.get("content-length") ?? 0) > maxBytes) return null
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxBytes) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return bytes
}

const RAW = z.object({ raw: z.object({ download_url: z.string() }).nullish() })

/** The transport on the Resend Node SDK (receiving, attachments, inbox replies, sending, forwarding). */
export function resendTransport(apiKey: string): MailTransport {
  const resend = new Resend(apiKey)

  async function send({ from, to, subject, text, html, attachments, replyTo, headers, idempotencyKey }: NewEmail): Promise<string> {
    const { data, error } = await resend.emails.send(
      { from, to: [to], subject, text, ...(html && { html }), ...(attachments?.length && { attachments }), ...(replyTo && { replyTo }), headers },
      { idempotencyKey },
    )
    if (error?.name === "invalid_idempotent_request") return ALREADY_SENT
    if (error || !data) throw new TransportError(error?.name ?? "empty")
    return data.id
  }

  return {
    async getEmail(emailId) {
      const { data, error } = await resend.emails.receiving.get(emailId, { html_format: "cid" })
      if (error) {
        if (error.name === "not_found") return null
        throw new TransportError(error.name)
      }
      return toInboundEmail(data)
    },
    async getAttachment(emailId, attachmentId, maxBytes) {
      const { data, error } = await resend.emails.receiving.attachments.get({ emailId, id: attachmentId })
      if (error) {
        if (error.name === "not_found") return null
        throw new TransportError(error.name)
      }
      if (!data || data.size > maxBytes) return null
      return download(data.download_url, maxBytes)
    },
    async replyInThread({ inboxId, threadId, emailId, text, html, attachments, headers, idempotencyKey }) {
      const { data, error } = await resend.inboxes.threads.emails.reply(
        { inboxId, threadId, emailId, text, ...(html && { html }), ...(attachments?.length && { attachments }), headers, replyAll: false },
        { idempotencyKey },
      )
      if (error?.name === "invalid_idempotent_request") return ALREADY_SENT
      if (error || !data) throw new TransportError(error?.name ?? "empty")
      return data.id
    },
    send,
    async forward({ emailId, ...email }) {
      const { data, error } = await resend.emails.receiving.get(emailId)
      if (error) throw new TransportError(error.name)
      const url = RAW.safeParse(data).data?.raw?.download_url
      const raw = url ? await download(url, MAX_FORWARD_BYTES) : null
      const attachments = raw ? [{ filename: "original.eml", content: Buffer.from(raw).toString("base64"), contentType: "message/rfc822" }] : []
      return send({ ...email, attachments })
    },
    async inboxAddress(inboxId) {
      const { data, error } = await resend.inboxes.get(inboxId)
      if (error) {
        if (error.name === "not_found") return null
        throw new TransportError(error.name)
      }
      return data ? data.email_address.toLowerCase() : null
    },
  }
}

import "server-only"
import { sanitizeText } from "@/lib/ai/text/sanitize"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import type { Locale } from "@/lib/i18n/locales"
import type { MailAgentConfig } from "../env"
import type { InboundEmail, MailTransport } from "../inbound/transport"
import { normalizeAddress } from "../store/sender-id"

/** Every email the agent writes says it is automatic and written by AI (PLAN-AGENT-06 step 10). */
export const AI_HEADERS: Readonly<Record<string, string>> = {
  "Auto-Submitted": "auto-replied",
  "X-Auto-Response-Suppress": "All",
  "X-First-Move-AI": "generated",
}

export interface ThreadRef {
  inboxId: string
  threadId: string
}

/** A file sent with a reply: the project file (`.firstmove.json`), base64. */
export interface ReplyAttachment {
  filename: string
  content: string
  contentType: string
}

/** One reply; `kind` names it in the idempotency key, so a retried step never sends it twice. */
export interface OutgoingReply {
  kind: string
  text: string
  html?: string
  attachments?: ReplyAttachment[]
}

/** A Message-ID we may repeat in a header: angle brackets, no spaces or line breaks. */
const MESSAGE_ID = /^<[^\s<>]{1,900}>$/

/**
 * Whether the Inbox reply API may answer: it writes to the Reply-To, which DMARC does not
 * authenticate, so only when there is none or it is the From address itself.
 */
export function repliesInThread(email: Pick<InboundEmail, "replyTo"> & { from: string }): boolean {
  if (email.replyTo.length === 0) return true
  return email.replyTo.length === 1 && normalizeAddress(email.replyTo[0]) === normalizeAddress(email.from)
}

/** `Re: <subject>` on one line, sanitised, at most 200 characters. */
export function replySubject(subject: string): string {
  const line = sanitizeText(subject.replace(/\s+/g, " ")).text.slice(0, 200).trim()
  if (!line) return "Re: First Move"
  return /^re:/i.test(line) ? line : `Re: ${line}`
}

/** `"First Move assistant (AI)" <agent@…>`: quoted, so the brackets stay part of the name. */
export async function agentFrom(config: Pick<MailAgentConfig, "addresses">, locale: Locale = "en"): Promise<string> {
  const { sender } = await getDictionary(locale, "mail")
  return `"${sender.name}" <${config.addresses.agent}>`
}

/**
 * Sends a reply to the authenticated sender only (PLAN-AGENT-06 step 10): in the thread when
 * `repliesInThread` allows it, otherwise as a new email to the From address with In-Reply-To and
 * References. Never to a Reply-To, never with CC or BCC. Returns Resend's id.
 */
export async function sendReply(
  transport: MailTransport,
  config: MailAgentConfig,
  email: InboundEmail & { from: string },
  thread: ThreadRef,
  reply: OutgoingReply,
  locale: Locale = "en",
): Promise<string> {
  const idempotencyKey = `reply/${email.id}/${reply.kind}`
  const body = { text: reply.text, ...(reply.html && { html: reply.html }), ...(reply.attachments?.length && { attachments: reply.attachments }) }
  if (repliesInThread(email)) {
    return transport.replyInThread({ ...thread, emailId: email.id, ...body, headers: { ...AI_HEADERS }, idempotencyKey })
  }
  const headers: Record<string, string> = { ...AI_HEADERS }
  if (email.messageId && MESSAGE_ID.test(email.messageId)) {
    headers["In-Reply-To"] = email.messageId
    headers.References = email.messageId
  }
  return transport.send({ from: await agentFrom(config, locale), to: email.from, subject: replySubject(email.subject), ...body, headers, idempotencyKey })
}

import "server-only"
import type { Locale } from "@/lib/i18n/locales"
import { saveOutbox } from "../conversation/outbox"
import type { StoredReply } from "../conversation/state"
import { logEvent, sidPrefix } from "../log"
import { sendReply, type OutgoingReply } from "../outbound/send"
import { markDone, type Sender } from "./sender"
import type { InboundInput, MailDeps } from "./types"

/** A reply as it is kept until it is sent. */
export function toStored(emailId: string, locale: Locale, reply: OutgoingReply): StoredReply {
  return { emailId, locale, kind: reply.kind, text: reply.text, ...(reply.html && { html: reply.html }), ...(reply.attachments?.length && { attachments: reply.attachments }) }
}

/**
 * Sends a reply that was saved first (with the conversation, or in the outbox) and marks the
 * email done. A step that runs again finds the saved reply and sends the same one; Resend's
 * idempotency key (`reply/{emailId}/{kind}`) keeps it to one email.
 */
export async function deliver(deps: MailDeps, input: InboundInput, sender: Sender, reply: StoredReply): Promise<string> {
  const { kind, locale, text, html, attachments } = reply
  await sendReply(deps.transport, deps.config, sender.email, input, { kind, text, ...(html && { html }), ...(attachments && { attachments }) }, locale)
  await markDone(deps.store, sender.email.id, kind)
  logEvent("reply", { sid: sidPrefix(sender.sid), kind, file: Boolean(attachments?.length) })
  return kind
}

/** A reply outside the conversation record (a notice, the end, a hand-off): into the outbox, then out. */
export async function deliverOnce(deps: MailDeps, input: InboundInput, sender: Sender, locale: Locale, reply: OutgoingReply): Promise<string> {
  const stored = toStored(sender.email.id, locale, reply)
  await saveOutbox(deps.store, deps.config.secrets.state, stored)
  return deliver(deps, input, sender, stored)
}

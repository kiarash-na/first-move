import "server-only"
import { newEmailText } from "@/lib/ai/text/email-body"
import { sanitizeText } from "@/lib/ai/text/sanitize"
import { truncateText } from "@/lib/ai/text/truncate"
import type { InboundEmail } from "../inbound/transport"
import { hiddenText } from "./hidden"

/** Caps that keep the state far below Jev's 32,000 tokens for state plus the longest question. */
export const STATE_LIMITS = { subject: 300, body: 12_000, attachments: 10, name: 120, type: 100 } as const

/** What Jev sees of one email: JSON only, and no address. */
export type GuardState = {
  subject: string
  body: string
  attachments: { name: string; type: string; size: number }[]
  phase: string
  hidden?: string
}

const clean = (text: string, max: number) => truncateText(sanitizeText(text).text, max).text
const oneLine = (text: string, max: number) => clean(text.replace(/\s+/g, " "), max)

/**
 * The email as Jev judged it and as a later model reads it: the subject on one line and the new
 * text (quoted history removed, sanitised, at most 12,000 characters). Nothing else of an email
 * reaches a model.
 */
export function judgedText(email: Pick<InboundEmail, "subject" | "text">): { subject: string; body: string } {
  return { subject: oneLine(email.subject, STATE_LIMITS.subject), body: clean(newEmailText(email.text).text, STATE_LIMITS.body) }
}

/**
 * The state Jev judges (PLAN-AGENT-06 step 9): the same new text a model would later see (quoted
 * history removed, sanitised, at most 12,000 characters), the subject, the attachments' names,
 * types and sizes, the conversation phase, and, when there is any, the text the email hid.
 */
export function guardState(email: Pick<InboundEmail, "subject" | "text" | "attachments">, phase: string): GuardState {
  const body = newEmailText(email.text).text
  const hidden = hiddenText(`${email.subject}\n${body}`)
  return {
    ...judgedText(email),
    attachments: email.attachments.slice(0, STATE_LIMITS.attachments).map((file) => ({
      name: oneLine(file.name ?? "file", STATE_LIMITS.name),
      type: oneLine(file.contentType ?? "unknown", STATE_LIMITS.type),
      size: file.size,
    })),
    phase,
    ...(hidden && { hidden }),
  }
}

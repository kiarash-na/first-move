import "server-only"
import { z } from "zod"

/** Ids as Resend sends them; anything else never reaches a store key or an API path. */
const ID = z.string().regex(/^[A-Za-z0-9_.:-]{1,128}$/)

const EVENT = z.object({ type: z.string(), data: z.unknown() })

const INBOX_EMAIL = z.object({
  inbox_id: ID,
  thread_id: ID,
  email_id: ID,
  email: z.object({ direction: z.enum(["inbound", "outbound"]).optional() }).optional(),
})

/** What the workflow gets: ids only, never content. */
export interface InboundRef {
  emailId: string
  threadId: string
  inboxId: string
}

export type ParsedEvent =
  | { kind: "inbound"; ref: InboundRef; direction?: "inbound" | "outbound" }
  | { kind: "ignored"; reason: "type" }
  | { kind: "invalid" }

/**
 * Reads a verified webhook event (PLAN-AGENT-06 step 5): only `inbox.email.received` counts; any
 * other type is ignored, including `email.received`, so one email never starts two runs.
 */
export function parseEvent(payload: unknown): ParsedEvent {
  const event = EVENT.safeParse(payload)
  if (!event.success) return { kind: "invalid" }
  if (event.data.type !== "inbox.email.received") return { kind: "ignored", reason: "type" }
  const data = INBOX_EMAIL.safeParse(event.data.data)
  if (!data.success) return { kind: "invalid" }
  const { inbox_id, thread_id, email_id, email } = data.data
  return { kind: "inbound", ref: { emailId: email_id, threadId: thread_id, inboxId: inbox_id }, ...(email?.direction && { direction: email.direction }) }
}

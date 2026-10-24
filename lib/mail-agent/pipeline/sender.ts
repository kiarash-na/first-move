import "server-only"
import type { InboundEmail } from "../inbound/transport"
import { keys, TTL } from "../store/keys"
import { domainId, domainOf, senderId } from "../store/sender-id"
import type { MailStore } from "../store/store"
import type { InboundInput, MailDeps } from "./types"

/** An email with an address, and the ids its sender is known by. */
export interface Sender {
  email: InboundEmail & { from: string }
  sid: string
}

/** Fetches the email again (steps never pass content) and derives the sender's id; null when it is gone or has no address. */
export async function loadSender(deps: MailDeps, input: InboundInput): Promise<Sender | null> {
  const email = await deps.transport.getEmail(input.emailId)
  if (!email?.from) return null
  return { email: email as Sender["email"], sid: await senderId(deps.config.secrets.hash, email.from) }
}

export async function domainIds(deps: MailDeps, address: string): Promise<{ domain: string; domainSid: string }> {
  return { domain: domainOf(address), domainSid: await domainId(deps.config.secrets.hash, address) }
}

/** Marks an email as handled (`done:{emailId}`, 30 days), so any later run drops it at the first gate. */
export async function markDone(store: MailStore, emailId: string, code: string): Promise<void> {
  await store.set(keys.done(emailId), code, { ttlMs: TTL.done })
}

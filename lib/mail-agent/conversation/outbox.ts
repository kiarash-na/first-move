import "server-only"
import { open, seal } from "../store/crypto"
import { keys, TTL } from "../store/keys"
import type { MailStore } from "../store/store"
import { STORED_REPLY, type StoredReply } from "./state"

/**
 * A reply that no conversation record carries (the end of a conversation, a hand-off), sealed
 * in `out:{emailId}` for a day: written before it is sent, so a retried step sends the same reply
 * instead of deciding again.
 */
export async function saveOutbox(store: MailStore, secret: Uint8Array, reply: StoredReply): Promise<void> {
  const key = keys.outbox(reply.emailId)
  await store.set(key, await seal(secret, key, JSON.stringify(reply)), { ttlMs: TTL.outbox })
}

/** The reply kept for an email, or null. */
export async function loadOutbox(store: MailStore, secret: Uint8Array, emailId: string): Promise<StoredReply | null> {
  const key = keys.outbox(emailId)
  const sealed = await store.get(key)
  if (!sealed) return null
  const plain = await open(secret, key, sealed)
  if (!plain) return null
  try {
    const parsed = STORED_REPLY.safeParse(JSON.parse(plain))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

import "server-only"
import { open, seal } from "../store/crypto"
import { keys, TTL } from "../store/keys"
import type { MailStore } from "../store/store"

/** An email waiting for its sender's consent: ids only; the email itself stays in Resend. */
export interface PendingRef {
  emailId: string
  threadId: string
  inboxId: string
  at: number
}

export const MAX_PENDING = 3

async function read(store: MailStore, secret: Uint8Array, key: string, now: number): Promise<PendingRef[]> {
  const sealed = await store.get(key)
  const plain = sealed ? await open(secret, key, sealed) : null
  const list = plain ? (JSON.parse(plain) as PendingRef[]) : []
  return list.filter((entry) => now - entry.at < TTL.pending)
}

/**
 * Keeps an email for its sender until they confirm (D-54): at most three per sender, each for
 * seven days, sealed with the state key. Returns `known` for an email already waiting.
 */
export async function addPending(store: MailStore, secret: Uint8Array, sid: string, ref: Omit<PendingRef, "at">, now: number): Promise<"added" | "known" | "full"> {
  const key = keys.pending(sid)
  const list = await read(store, secret, key, now)
  if (list.some((entry) => entry.emailId === ref.emailId)) return "known"
  if (list.length >= MAX_PENDING) return "full"
  await store.set(key, await seal(secret, key, JSON.stringify([...list, { ...ref, at: now }])), { ttlMs: TTL.pending })
  return "added"
}

/** Every email of a sender still waiting, oldest first. */
export async function pendingOf(store: MailStore, secret: Uint8Array, sid: string, now: number): Promise<PendingRef[]> {
  return (await read(store, secret, keys.pending(sid), now)).sort((a, b) => a.at - b.at)
}

/** Forgets the given emails (once their runs started), keeping any that arrived meanwhile. Run it under the sender's lock. */
export async function removePending(store: MailStore, secret: Uint8Array, sid: string, emailIds: readonly string[], now: number): Promise<void> {
  const key = keys.pending(sid)
  const rest = (await read(store, secret, key, now)).filter((entry) => !emailIds.includes(entry.emailId))
  if (rest.length === 0) await store.del(key)
  else await store.set(key, await seal(secret, key, JSON.stringify(rest)), { ttlMs: TTL.pending })
}

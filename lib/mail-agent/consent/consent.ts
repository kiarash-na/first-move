import "server-only"
import { keys, TTL } from "../store/keys"
import type { MailStore } from "../store/store"

/** What a sender accepted, and when (D-54): the versions of the Terms and the Privacy Policy. */
export interface ConsentRecord {
  at: string
  terms: string
  privacy: string
}

export async function hasConsent(store: MailStore, sid: string): Promise<boolean> {
  return (await store.get(keys.consent(sid))) !== null
}

export async function recordConsent(store: MailStore, sid: string, record: ConsentRecord): Promise<void> {
  await store.set(keys.consent(sid), JSON.stringify(record), { ttlMs: TTL.consent })
}

/** Consent records live twelve months after the sender's last message (D-56). */
export async function touchConsent(store: MailStore, sid: string): Promise<void> {
  await store.expire(keys.consent(sid), TTL.consent)
}

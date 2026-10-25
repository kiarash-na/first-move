import "server-only"
import { keys, TTL } from "./keys"
import type { MailStore } from "./store"

export type Locked<T> = { ok: true; value: T } | { ok: false }

/**
 * Runs `work` while holding the sender's lock (`SET NX PX 120000`), so two emails from one sender
 * never update the same state at once. Busy → `{ ok: false }` (the step retries later). The lock is
 * released only if it is still ours, atomically: a lock that lapsed and was re-acquired mid-flight
 * is never deleted from under its new holder. The lock expires by itself if a run dies.
 */
export async function withSenderLock<T>(store: MailStore, sid: string, work: () => Promise<T>): Promise<Locked<T>> {
  const key = keys.lock(sid)
  const token = crypto.randomUUID()
  if (!(await store.set(key, token, { ttlMs: TTL.lock, ifAbsent: true }))) return { ok: false }
  try {
    return { ok: true, value: await work() }
  } finally {
    await store.compareAndDelete(key, token)
  }
}

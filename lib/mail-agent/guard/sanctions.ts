import "server-only"
import { keys, TTL } from "../store/keys"
import type { MailStore } from "../store/store"
import type { Verdict } from "./policy"
import type { Threat } from "./questions"

/** The second strike within 90 days bans the sender for 30 days (D-55). */
export const STRIKES_TO_BAN = 2
const KEPT = 10

export type Notice = "warning" | "ban" | "block" | "unavailable"

function emailsOf(raw: string | null): string[] {
  try {
    const value: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : []
  } catch {
    return []
  }
}

/**
 * Counts a strike for this email (D-55): the record lists the emails that earned one, so a step
 * that runs again never counts the same email twice. 90 days from the latest strike. Run it under
 * the sender's lock. Returns the number of strikes.
 */
export async function addStrike(store: MailStore, sid: string, emailId: string): Promise<number> {
  const key = keys.strikes(sid)
  const emails = emailsOf(await store.get(key))
  if (emails.includes(emailId)) return emails.length
  const next = [...emails, emailId].slice(-KEPT)
  await store.set(key, JSON.stringify(next), { ttlMs: TTL.strikes })
  return next.length
}

/** A 30-day ban; the strikes stay, so the next strike within their 90 days bans again. */
export async function banSender(store: MailStore, sid: string, now: number): Promise<void> {
  await store.set(keys.ban(sid), JSON.stringify({ at: new Date(now).toISOString() }), { ttlMs: TTL.ban, ifAbsent: true })
}

/** A permanent block (D-55): the category and the time only, never content; no unblock action. */
export async function blockSender(store: MailStore, sid: string, category: Threat, now: number): Promise<void> {
  await store.set(keys.block(sid), JSON.stringify({ category, at: new Date(now).toISOString() }), { ifAbsent: true })
}

/**
 * Applies a verdict to the sender's record and says which notice the sender gets: a warning for
 * the first strike, the ban notice for the second, the block notice once, or none. Safe to repeat.
 */
export async function applyVerdict(store: MailStore, sid: string, emailId: string, verdict: Verdict, now: number): Promise<Notice | null> {
  switch (verdict.action) {
    case "strike": {
      if ((await addStrike(store, sid, emailId)) < STRIKES_TO_BAN) return "warning"
      await banSender(store, sid, now)
      return "ban"
    }
    case "block":
      await blockSender(store, sid, verdict.category, now)
      return "block"
    case "unavailable":
      return "unavailable"
    default:
      return null
  }
}

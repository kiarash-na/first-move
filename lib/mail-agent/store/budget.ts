import "server-only"
import { dayOf, keys, TTL } from "./keys"
import type { MailStore } from "./store"

/** Spend is counted in micro-dollars (whole numbers), per UTC day. */
export const MICRO_USD = 1_000_000

/** Adds model spend to today's counter and returns the new total in micro-dollars. */
export function addSpend(store: MailStore, microUsd: number, now: number): Promise<number> {
  return store.incr(keys.budget(dayOf(now)), TTL.budget, Math.max(0, Math.ceil(microUsd)))
}

/** Today's spend in micro-dollars. */
export async function spentToday(store: MailStore, now: number): Promise<number> {
  return Number((await store.get(keys.budget(dayOf(now)))) ?? 0)
}

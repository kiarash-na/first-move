import "server-only"
import { keys, type RateScope } from "./keys"
import type { MailStore } from "./store"

export interface RateRule {
  scope: RateScope
  limit: number
  windowMs: number
}

const HOUR = 3_600_000
const DAY = 24 * HOUR

/** The limits of PLAN-AGENT-06 step 7.5; counts come from the environment. */
export function rateRules(limits: { senderPerHour: number; senderPerDay: number; globalPerDay: number }) {
  return {
    senderHour: { scope: "sender-hour", limit: limits.senderPerHour, windowMs: HOUR },
    senderDay: { scope: "sender-day", limit: limits.senderPerDay, windowMs: DAY },
    domainDay: { scope: "domain-day", limit: 100, windowMs: DAY },
    globalDay: { scope: "global-day", limit: limits.globalPerDay, windowMs: DAY },
  } satisfies Record<string, RateRule>
}

/**
 * Counts one hit against a sliding window (the weighted sum of the current and the previous fixed
 * window, as Upstash's own limiter does), with two INCR counters, so the memory store and Upstash
 * behave alike. Every hit counts, also one over the limit, so a flood stays limited.
 */
export async function hitRate(store: MailStore, rule: RateRule, subject: string, now: number): Promise<{ allowed: boolean; estimate: number }> {
  const window = Math.floor(now / rule.windowMs)
  const elapsed = (now % rule.windowMs) / rule.windowMs
  const current = await store.incr(keys.rate(rule.scope, subject, window), rule.windowMs * 2)
  const previous = Number((await store.get(keys.rate(rule.scope, subject, window - 1))) ?? 0)
  const estimate = previous * (1 - elapsed) + current
  return { allowed: estimate <= rule.limit, estimate }
}

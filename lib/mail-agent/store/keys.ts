import "server-only"

const PREFIX = "fm:mail:"
const DAY = 86_400_000

/** How long each record lives (D-56); null keeps it until it is deleted. */
export const TTL = {
  event: 7 * DAY,
  done: 30 * DAY,
  pending: 7 * DAY,
  confirm: 7 * DAY,
  confirmSent: DAY,
  consent: 365 * DAY,
  conversation: 30 * DAY,
  strikes: 90 * DAY,
  ban: 30 * DAY,
  block: null,
  lock: 120_000,
  budget: 3 * DAY,
  alerts: 2 * DAY,
} as const

/** Ids from outside (webhook ids, email ids) and our own ids; anything else is refused. */
const ID = /^[A-Za-z0-9_.:-]{1,128}$/
const DATE = /^\d{4}-\d{2}-\d{2}$/

function id(value: string): string {
  if (!ID.test(value)) throw new Error("Invalid store key part")
  return value
}

function day(value: string): string {
  if (!DATE.test(value)) throw new Error("Invalid store key day")
  return value
}

export type RateScope = "sender-hour" | "sender-day" | "domain-day" | "global-day"

/**
 * Every store key, under `fm:mail:` (PLAN-AGENT-06 step 4): one builder per record, so the TTL
 * table applies in one place. Sender and domain parts are HMAC ids, never addresses.
 */
export const keys = {
  event: (svixId: string) => `${PREFIX}evt:${id(svixId)}`,
  done: (emailId: string) => `${PREFIX}done:${id(emailId)}`,
  pending: (sid: string) => `${PREFIX}pending:${id(sid)}`,
  confirm: (tokenId: string) => `${PREFIX}confirm:${id(tokenId)}`,
  confirmSent: (sid: string) => `${PREFIX}confirm-sent:${id(sid)}`,
  consent: (sid: string) => `${PREFIX}consent:${id(sid)}`,
  conversation: (sid: string) => `${PREFIX}conv:${id(sid)}`,
  strikes: (sid: string) => `${PREFIX}strikes:${id(sid)}`,
  ban: (sid: string) => `${PREFIX}ban:${id(sid)}`,
  block: (sid: string) => `${PREFIX}block:${id(sid)}`,
  lock: (sid: string) => `${PREFIX}lock:${id(sid)}`,
  rate: (scope: RateScope, subject: string, window: number) => `${PREFIX}rl:${scope}:${id(subject)}:${Math.floor(window)}`,
  budget: (date: string) => `${PREFIX}budget:${day(date)}`,
  alerts: (date: string) => `${PREFIX}alerts:${day(date)}`,
  alertOnce: (kind: string, date: string) => `${PREFIX}alert-once:${id(kind)}:${day(date)}`,
}

/** The UTC day of a time, as budgets and alert counters use it. */
export const dayOf = (now: number) => new Date(now).toISOString().slice(0, 10)

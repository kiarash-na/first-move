import "server-only"
import { hitRate, rateRules } from "../store/ratelimit"
import { drop, pass, type Gate } from "./types"

/** Large free-mail providers: the per-domain limit would hit unrelated people, so it does not apply. */
export const FREE_MAIL = new Set([
  "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com", "msn.com", "yahoo.com", "yahoo.de", "icloud.com",
  "me.com", "aol.com", "proton.me", "protonmail.com", "gmx.de", "gmx.net", "gmx.at", "gmx.ch", "web.de", "t-online.de",
  "freenet.de", "mail.de", "posteo.de", "mailbox.org", "outlook.de", "hotmail.de",
])

/**
 * Gate 5 (PLAN-AGENT-06 step 7.5): per sender 10 an hour and 30 a day, per domain 100 a day
 * (except free mail), 500 a day in total; counts from the environment. Every check counts the email.
 */
export const rateLimitGate: Gate = async ({ sid, domainSid, domain, config, store, now }) => {
  const rules = rateRules(config.limits)
  if (!(await hitRate(store, rules.senderHour, sid, now)).allowed) return drop("rate-sender")
  if (!(await hitRate(store, rules.senderDay, sid, now)).allowed) return drop("rate-sender")
  if (!FREE_MAIL.has(domain) && !(await hitRate(store, rules.domainDay, domainSid, now)).allowed) return drop("rate-domain")
  if (!(await hitRate(store, rules.globalDay, "all", now)).allowed) return drop("rate-global")
  return pass
}

import "server-only"
import { newEmailText } from "@/lib/ai/text/email-body"
import { restrictLinks } from "@/lib/ai/text/links"
import { sanitizeText } from "@/lib/ai/text/sanitize"
import { formatDateTime } from "@/lib/i18n/format/date"
import { formatNumber } from "@/lib/i18n/format/number"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { interpolate } from "@/lib/i18n/interpolate"
import type { MailAgentConfig } from "../env"
import type { InboundEmail, MailTransport } from "../inbound/transport"
import { agentFrom } from "../outbound/send"
import { dayOf, keys, TTL } from "../store/keys"
import type { MailStore } from "../store/store"

export const MAX_ALERTS_PER_DAY = 20
export const EXCERPT_CHARS = 300

export type SenderAlertKind = "block" | "guard-failed" | "attachment-injection"
export type SystemAlertKind = "rate-global" | "budget" | "text-failed"

/** About one sender's email, with its scores; or about the agent as a whole, with no sender data. */
export type Alert =
  | { kind: SenderAlertKind; email: InboundEmail & { from: string }; category: string; scores: Record<string, number> }
  | { kind: SystemAlertKind }

export interface AlertDeps {
  config: MailAgentConfig
  store: MailStore
  transport: MailTransport
}

/** An alert is not a reply: automatic, and no out-of-office answers to it. */
const HEADERS = { "Auto-Submitted": "auto-generated", "X-Auto-Response-Suppress": "All" }

const oneLine = (text: string, max: number) => [...sanitizeText(text.replace(/\s+/g, " ")).text].slice(0, max).join("")

/** The first 300 characters of the new text, sanitised, with every outside link defanged. */
export function excerptOf(text: string): string {
  return restrictLinks([...sanitizeText(newEmailText(text).text).text].slice(0, EXCERPT_CHARS).join(""))
}

const scoresText = (scores: Record<string, number>) =>
  Object.entries(scores)
    .map(([name, value]) => `${name} ${formatNumber(value, "en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    .join(" · ")

async function compose(config: MailAgentConfig, alert: Alert, now: number): Promise<{ subject: string; text: string; key: string }> {
  const { admin } = await getDictionary("en", "mail")
  const kind = admin.kinds[alert.kind]
  const at = `${formatDateTime(new Date(now).toISOString(), "en", { timeZone: "UTC" })} UTC`
  const subject = interpolate(admin.subject, { kind })
  if (!("email" in alert)) {
    const detail = interpolate(admin.details[alert.kind], {
      limit: formatNumber(config.limits.globalPerDay, "en"),
      budget: formatNumber(config.limits.dailyBudgetUsd, "en", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    })
    return { subject, text: interpolate(admin.system, { kind, at, detail }), key: `alert/${alert.kind}/${dayOf(now)}` }
  }
  const text = interpolate(admin.body, {
    kind,
    category: alert.category,
    scores: scoresText(alert.scores) || "–",
    at,
    address: alert.email.from,
    subject: oneLine(alert.email.subject, 200),
    emailId: alert.email.id,
    excerpt: excerptOf(alert.email.text),
  })
  return { subject, text, key: `alert/${alert.email.id}/${alert.kind}` }
}

/**
 * Tells the admin (`EMAIL_AGENT_ADMIN_ADDRESS` only) what happened (PLAN-AGENT-06 step 11):
 * at most 20 alerts a UTC day, then one line that more were held back, then nothing until the
 * next day. There is no unblock link (D-55). Returns what it did.
 */
export async function sendAlert(deps: AlertDeps, alert: Alert, now: number): Promise<"sent" | "more" | "held"> {
  const day = dayOf(now)
  const count = await deps.store.incr(keys.alerts(day), TTL.alerts)
  if (count > MAX_ALERTS_PER_DAY + 1) return "held"
  const { admin } = await getDictionary("en", "mail")
  const message =
    count > MAX_ALERTS_PER_DAY
      ? { subject: interpolate(admin.subject, { kind: admin.moreKind }), text: interpolate(admin.more, { max: formatNumber(MAX_ALERTS_PER_DAY, "en") }), key: `alert/more/${day}` }
      : await compose(deps.config, alert, now)
  await deps.transport.send({
    from: await agentFrom(deps.config),
    to: deps.config.addresses.admin,
    subject: message.subject,
    text: message.text,
    headers: HEADERS,
    idempotencyKey: message.key,
  })
  return count > MAX_ALERTS_PER_DAY ? "more" : "sent"
}

/**
 * One alert of a kind a day (the global limit, the budget), however many emails hit it. The first
 * email of the day owns the alert, so a retried step sends it again with the same idempotency key.
 */
export async function alertOncePerDay(deps: AlertDeps, kind: SystemAlertKind, emailId: string, now: number): Promise<void> {
  const key = keys.alertOnce(kind, dayOf(now))
  const owner = (await deps.store.set(key, emailId, { ttlMs: TTL.alerts, ifAbsent: true })) ? emailId : await deps.store.get(key)
  if (owner === emailId) await sendAlert(deps, { kind }, now)
}

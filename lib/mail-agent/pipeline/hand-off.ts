import "server-only"
import { sanitizeText } from "@/lib/ai/text/sanitize"
import { formatDateTime } from "@/lib/i18n/format/date"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Locale } from "@/lib/i18n/locales"
import { OPERATOR } from "@/lib/legal/operator"
import { handoffSection } from "../conversation/sections"
import { loadTexts } from "../conversation/texts"
import { logEvent, sidPrefix } from "../log"
import { composeReply } from "../outbound/message"
import { dayOf, keys, TTL } from "../store/keys"
import { deliverOnce } from "./deliver"
import type { Sender } from "./sender"
import type { InboundInput, MailDeps } from "./types"

/** Mail from us to the person behind human@ is automatic: no out-of-office answers to it. */
export const OPERATOR_HEADERS = { "Auto-Submitted": "auto-generated", "X-Auto-Response-Suppress": "All" }

/** `"First Move" <human@…>`: what the person behind human@ receives comes from human@. */
export const humanFrom = () => `"First Move" <${OPERATOR.emailHuman}>`

const oneLine = (text: string) => sanitizeText(text.replace(/\s+/g, " ")).text.slice(0, 200).trim()

/**
 * Passes the email on to the person behind human@ (`EMAIL_AGENT_ADMIN_ADDRESS`), the original
 * attached, with Reply-To set to the sender: DMARC passed at gate 2, so a reply reaches the
 * person who wrote. Once per sender and day, so the agent cannot be used to flood the operator.
 */
async function passOn(deps: MailDeps, sender: Sender, now: number): Promise<boolean> {
  const { store, config, transport } = deps
  const { email, sid } = sender
  const key = keys.handoff(sid, dayOf(now))
  const owner = (await store.set(key, email.id, { ttlMs: TTL.handoff, ifAbsent: true })) ? email.id : await store.get(key)
  if (owner !== email.id) return false
  const { admin } = await getDictionary("en", "mail")
  const subject = oneLine(email.subject) || "–"
  const at = `${formatDateTime(new Date(now).toISOString(), "en", { timeZone: "UTC" })} UTC`
  await transport.forward({
    emailId: email.id,
    from: humanFrom(),
    to: config.addresses.admin,
    replyTo: email.from,
    subject: interpolate(admin.handoff.subject, { subject }),
    text: interpolate(admin.handoff.body, { address: email.from, at, subject }),
    headers: OPERATOR_HEADERS,
    idempotencyKey: `handoff/${email.id}`,
  })
  return true
}

/**
 * "A person, please" (PLAN-AGENT-07 step 6, O8): the email goes to the person behind human@, and
 * the sender hears that a person answers by email. The conversation stays as it was.
 */
export async function handOff(deps: MailDeps, input: InboundInput, sender: Sender, locale: Locale, now: number): Promise<string> {
  const passed = await passOn(deps, sender, now)
  logEvent("handoff", { sid: sidPrefix(sender.sid), passed })
  const t = await loadTexts(locale)
  return deliverOnce(deps, input, sender, locale, await composeReply(deps.config, locale, "handoff", [handoffSection(t, { again: !passed })], { commands: true }))
}

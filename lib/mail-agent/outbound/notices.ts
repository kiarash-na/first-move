import "server-only"
import type { Accent, Section } from "@/emails/model"
import { formatNumber } from "@/lib/i18n/format/number"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Locale } from "@/lib/i18n/locales"
import { CONFIRM_DAYS } from "../consent/token"
import type { MailAgentConfig } from "../env"
import type { Notice } from "../guard/sanctions"
import { TTL } from "../store/keys"
import { composeReply, sitePage } from "./message"
import type { OutgoingReply } from "./send"

/** Days of a ban (D-55), as the warning and the ban notice name them. */
export const BAN_DAYS = TTL.ban / 86_400_000

/** Warnings, bans and blocks are about risk: orange (D-15). */
const ACCENT: Record<Notice, Accent> = { warning: "hot", ban: "hot", block: "hot", unavailable: "ink" }

type SiteConfig = Pick<MailAgentConfig, "siteUrl">

/** A guard notice (PLAN-AGENT-06 step 12) as an on-brand email in the sender's language. */
export async function notice(config: SiteConfig, locale: Locale, kind: Notice): Promise<OutgoingReply> {
  const copy = (await getDictionary(locale, "mail")).notices[kind]
  const days = formatNumber(BAN_DAYS, locale)
  const section: Section = { kicker: copy.kicker, title: copy.title, accent: ACCENT[kind], blocks: copy.body.map((text) => ({ type: "text", text: interpolate(text, { days }) })) }
  return composeReply(config, locale, kind, [section])
}

/** The one-time confirmation request (D-54): the confirm link as a button, the Terms, the seven days. */
export async function confirmNotice(config: SiteConfig, locale: Locale, link: string): Promise<OutgoingReply> {
  const copy = (await getDictionary(locale, "mail")).notices.confirm
  const values = { terms: sitePage(config, locale, "/terms"), days: formatNumber(CONFIRM_DAYS, locale) }
  const [first, ...rest] = copy.body.map((text) => interpolate(text, values))
  const section: Section = {
    kicker: copy.kicker,
    title: copy.title,
    accent: "cool",
    blocks: [{ type: "text", text: first }, { type: "button", label: copy.button, href: link, hint: copy.linkHint }, ...rest.map((text) => ({ type: "text" as const, text }))],
  }
  return composeReply(config, locale, "confirm", [section])
}

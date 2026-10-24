import "server-only"
import { formatNumber } from "@/lib/i18n/format/number"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { interpolate } from "@/lib/i18n/interpolate"
import { CONFIRM_DAYS } from "../consent/token"
import type { Notice } from "../guard/sanctions"
import { TTL } from "../store/keys"
import type { OutgoingReply } from "./send"

/** Days of a ban (D-55), as the warning and the ban notice name them. */
export const BAN_DAYS = TTL.ban / 86_400_000

/** A plain-text notice from `mail.json` (PLAN-AGENT-06 step 12); phase 07 gives them templates. */
export async function notice(kind: Notice): Promise<OutgoingReply> {
  const { notices } = await getDictionary("en", "mail")
  return { kind, text: interpolate(notices[kind], { days: formatNumber(BAN_DAYS, "en") }) }
}

/** The one-time confirmation request (D-54) with the confirm link and the Terms. */
export async function confirmNotice(link: string, terms: string): Promise<OutgoingReply> {
  const { notices } = await getDictionary("en", "mail")
  return { kind: "confirm", text: interpolate(notices.confirm, { link, terms, days: formatNumber(CONFIRM_DAYS, "en") }) }
}

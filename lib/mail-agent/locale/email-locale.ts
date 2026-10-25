import "server-only"
import { newEmailText } from "@/lib/ai/text/email-body"
import type { Locale } from "@/lib/i18n/locales"
import { detectLocale } from "./detect"

/**
 * The language to answer an email in (PLAN-AGENT-07 step 12): what its new text is written in;
 * when that is unclear (a short "1, yes"), the conversation's language; otherwise English.
 */
export function emailLocale(email: { subject: string; text: string }, fallback: Locale | null = null): Locale {
  return detectLocale(`${email.subject}\n${newEmailText(email.text).text}`) ?? fallback ?? "en"
}

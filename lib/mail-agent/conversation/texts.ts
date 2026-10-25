import "server-only"
import type { Texts } from "@/lib/ai/extract/field-label"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import type { Locale } from "@/lib/i18n/locales"

/** Every dictionary a conversation email reads, in one language (DE merged over EN, D-32). */
export interface MailTexts {
  locale: Locale
  mail: Dictionary<"mail">
  quickCheck: Dictionary<"quick-check">
  businessPlan: Dictionary<"business-plan">
  shell: Dictionary<"shell">
  calc: Dictionary<"calc">
  /** The same dictionaries as the field catalogue takes them. */
  texts: Texts
}

/** Loads the conversation's dictionaries for a language. */
export async function loadTexts(locale: Locale): Promise<MailTexts> {
  const [mail, quickCheck, businessPlan, shell, calc] = await Promise.all([
    getDictionary(locale, "mail"),
    getDictionary(locale, "quick-check"),
    getDictionary(locale, "business-plan"),
    getDictionary(locale, "shell"),
    getDictionary(locale, "calc"),
  ])
  return { locale, mail, quickCheck, businessPlan, shell, calc, texts: { "quick-check": quickCheck, "business-plan": businessPlan, shell } }
}

import type { Locale } from "@/lib/i18n/locales"

/** What First Move is and what both agents may help with (PLAN-AGENT-03 step 5). */
export const FIRST_MOVE_SCOPE =
  "First Move is a free web tool for the initial screening of fifth-generation district heating and cooling (5GDHC) " +
  "projects. It has two modules: the Quick Check, a deterministic assessment of a site's technical and economic " +
  "potential, and the Business Plan, a workspace for the business model. You help only with First Move, 5GDHC " +
  "screening and the user's project. Quick Check results always come from First Move's own calculation, never from you."

const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", de: "German" }

/** The language the agent writes in: the user's interface or email language. */
export function languageRule(lang: Locale): string {
  return `Write in ${LANGUAGE_NAMES[lang]}.`
}

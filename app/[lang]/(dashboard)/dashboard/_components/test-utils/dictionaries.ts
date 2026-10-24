import assumptionsDe from "@/dictionaries/de/assumptions.json"
import businessPlanDe from "@/dictionaries/de/business-plan.json"
import calcDe from "@/dictionaries/de/calc.json"
import commonDe from "@/dictionaries/de/common.json"
import quickCheckDe from "@/dictionaries/de/quick-check.json"
import shellDe from "@/dictionaries/de/shell.json"
import startDe from "@/dictionaries/de/start.json"
import assumptions from "@/dictionaries/en/assumptions.json"
import businessPlan from "@/dictionaries/en/business-plan.json"
import calc from "@/dictionaries/en/calc.json"
import common from "@/dictionaries/en/common.json"
import quickCheck from "@/dictionaries/en/quick-check.json"
import shell from "@/dictionaries/en/shell.json"
import start from "@/dictionaries/en/start.json"
import { deepMerge } from "@/lib/i18n/deep-merge"
import type { Locale } from "@/lib/i18n/locales"
import type { Dictionaries } from "../i18n-provider"

/** Tests only: the dashboard areas as `getDictionary` returns them (DE merged over EN, D-32). */
export function testDictionaries(lang: Locale = "en") {
  const en = { common, shell, calc, "quick-check": quickCheck, "business-plan": businessPlan, start, assumptions }
  if (lang === "en") return en
  return {
    common: deepMerge(common, commonDe),
    shell: deepMerge(shell, shellDe),
    calc: deepMerge(calc, calcDe),
    "quick-check": deepMerge(quickCheck, quickCheckDe),
    "business-plan": deepMerge(businessPlan, businessPlanDe),
    start: deepMerge(start, startDe),
    assumptions: deepMerge(assumptions, assumptionsDe),
  } satisfies Dictionaries
}

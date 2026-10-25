import { getExample, localizeExample } from "@/lib/examples"
import type { Locale } from "@/lib/i18n/locales"
import type { Project } from "@/lib/project"
import { run } from "@/lib/quick-check/run"
import type { ResultLevel } from "@/lib/quick-check/overall-rule"
import { fingerprint } from "./fingerprint"

/**
 * Slide 3: the real Quick Check engine on one of the app's illustrative examples. The server
 * renders the first result; "Run again" runs the same engine in the browser on the same inputs,
 * and the fingerprint of the full result shows that nothing changed.
 */
export const DEMO_EXAMPLE_ID = "school-kindergarten-flats"

export interface QuickCheckDemoResult {
  level: ResultLevel
  heatingDemandMwh: number
  heatDensityMwhPerM: number
  economicRatio: number | null
  /** Of every value, class and reason the engine returned. */
  fingerprint: string
}

export function demoProject(lang: Locale): Project {
  const example = getExample(DEMO_EXAMPLE_ID)
  if (!example) throw new Error(`Example ${DEMO_EXAMPLE_ID} is missing`)
  return localizeExample(example, lang)
}

export function runDemo(project: Project): QuickCheckDemoResult {
  const result = run(project)
  if (result.status !== "complete") throw new Error("The demo example must give a complete Quick Check")
  const { values, classes, assessment, drivers } = result
  return {
    level: assessment.level,
    heatingDemandMwh: values.heatingDemandKwh / 1000,
    heatDensityMwhPerM: values.heatDensityMwhPerM,
    economicRatio: values.economicRatio,
    fingerprint: fingerprint({ values, classes, assessment, drivers }),
  }
}

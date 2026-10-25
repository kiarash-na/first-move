import type { Project } from "@/lib/project"
import type { ResultLevel } from "@/lib/quick-check/overall-rule"
import { run } from "@/lib/quick-check/run"
import { fingerprint } from "./fingerprint"

/**
 * One Quick Check run for slide 3, shared by the server (first render) and the browser ("Run
 * again", loaded on demand), so both compute the fingerprint the same way.
 */
export interface QuickCheckDemoResult {
  level: ResultLevel
  heatingDemandMwh: number
  heatDensityMwhPerM: number
  economicRatio: number | null
  /** Of every value, class, reason and driver the engine returned. */
  fingerprint: string
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

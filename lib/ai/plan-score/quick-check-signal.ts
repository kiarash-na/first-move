import type { Project } from "@/lib/project"
import { run, type ResultLevel } from "@/lib/quick-check"

/**
 * The Quick Check as a deterministic signal (turn 0): its verdict and the figures the plan's
 * technical claims can be read against. Only when the module is on and the result complete;
 * the AI never computes any of it (D-27).
 */
export interface QuickCheckSignal {
  level: ResultLevel
  buildings: number | null
  heatDensityMwhPerM: number
  heatingDemandMwh: number
  coolingDemandMwh: number
  heatingCoverage: number | null
  coolingCoverage: number | null
  economicRatio: number | null
}

export function quickCheckSignal(project: Project): QuickCheckSignal | null {
  if (!project.meta.modules.quickCheck) return null
  const result = run(project)
  if (result.status !== "complete") return null
  const values = result.values
  return {
    level: result.assessment.level,
    buildings: project.buildings.total,
    heatDensityMwhPerM: values.heatDensityMwhPerM,
    heatingDemandMwh: values.heatingDemandKwh / 1000,
    coolingDemandMwh: values.coolingDemandKwh / 1000,
    heatingCoverage: values.heatingCoverage,
    coolingCoverage: values.coolingCoverage,
    economicRatio: values.economicRatio,
  }
}

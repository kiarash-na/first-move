import type { SourceKey } from "@/lib/project/catalog/sources"
import { coversAtLeast90 } from "./classify/coverage"
import type { CoverageClass, DensityClass, EconomicClass } from "./classify/rules.config"

/** QCT-RES-LEVELS: the three overall results, best first. */
export const RESULT_LEVELS = ["promising", "further_analysis", "not_promising"] as const
export type ResultLevel = (typeof RESULT_LEVELS)[number]

export const DEMANDS = ["heating", "cooling"] as const
export type Demand = (typeof DEMANDS)[number]

/** What TBL-11 looks at. A coverage class is null when that demand is not relevant (= 0, OQ-22). */
export interface OverallRuleInput {
  industry: boolean
  unknownSources: readonly SourceKey[]
  coverage: Record<Demand, CoverageClass | null>
  buildingDensity: DensityClass
  heatDensity: DensityClass
  economic: EconomicClass | null
}

/** Which OQ-22 step decided the level. */
export type RuleStep = "forced" | "not_promising" | "promising" | "otherwise"

export const REASON_CODES = [
  // (1) forced (QCT-RULE-INDUSTRY, QCT-RULE-UNKNOWN)
  "industry",
  "unknown_source",
  // (2) not promising
  "economics_clearly_unfavorable",
  "low_coverage_and_densities",
  // (3) promising: every criterion met
  "coverage_sufficient",
  "economics_favorable",
  "densities_not_low",
  // (4) otherwise: the promising criteria that are not met
  "no_relevant_demand",
  "coverage_below_promising",
  "economics_unclear",
  "building_density_low",
  "heat_density_low",
] as const
export type ReasonCode = (typeof REASON_CODES)[number]

export interface OverallReason {
  code: ReasonCode
  /** The demands a coverage reason is about. */
  demands?: Demand[]
  /** The sources with Unknown potential (`unknown_source`). */
  sources?: SourceKey[]
}

export interface OverallAssessment {
  level: ResultLevel
  /** True when industry or an unknown source set the level (KF-06). */
  forced: boolean
  step: RuleStep
  reasons: OverallReason[]
}

const relevantDemands = (input: OverallRuleInput) => DEMANDS.filter((demand) => input.coverage[demand] !== null)

/**
 * TBL-11 with the OQ-22 precedence: (1) industry share > 0 or a selected source with Unknown
 * potential → Further analysis required; (2) Not promising: the economic assessment is clearly
 * unfavorable, or a relevant coverage is below 70 % and building and heat density are both low;
 * (3) Promising: every relevant demand ≥ 90 %, economics favorable, neither density low;
 * (4) otherwise Further analysis required. A demand is relevant when it is > 0.
 */
export function overallResult(input: OverallRuleInput): OverallAssessment {
  const forced: OverallReason[] = []
  if (input.industry) forced.push({ code: "industry" })
  if (input.unknownSources.length > 0) forced.push({ code: "unknown_source", sources: [...input.unknownSources] })
  if (forced.length > 0) return { level: "further_analysis", forced: true, step: "forced", reasons: forced }

  const relevant = relevantDemands(input)
  const densitiesLow = input.buildingDensity === "low" && input.heatDensity === "low"
  const below70 = relevant.filter((demand) => input.coverage[demand] === "not_feasible")
  const notPromising: OverallReason[] = []
  if (input.economic === "clearly_unfavorable") notPromising.push({ code: "economics_clearly_unfavorable" })
  if (below70.length > 0 && densitiesLow) notPromising.push({ code: "low_coverage_and_densities", demands: below70 })
  if (notPromising.length > 0) return { level: "not_promising", forced: false, step: "not_promising", reasons: notPromising }

  const below90 = relevant.filter((demand) => !coversAtLeast90(input.coverage[demand]!))
  const unmet: OverallReason[] = []
  if (relevant.length === 0) unmet.push({ code: "no_relevant_demand" })
  if (below90.length > 0) unmet.push({ code: "coverage_below_promising", demands: below90 })
  if (input.economic !== "favorable") unmet.push({ code: "economics_unclear" })
  if (input.buildingDensity === "low") unmet.push({ code: "building_density_low" })
  if (input.heatDensity === "low") unmet.push({ code: "heat_density_low" })
  if (unmet.length > 0) return { level: "further_analysis", forced: false, step: "otherwise", reasons: unmet }

  return {
    level: "promising",
    forced: false,
    step: "promising",
    reasons: [
      { code: "coverage_sufficient", demands: relevant },
      { code: "economics_favorable" },
      { code: "densities_not_low" },
    ],
  }
}

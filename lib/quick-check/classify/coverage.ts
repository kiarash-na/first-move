import { COVERAGE_RULE, type CoverageClass } from "./rules.config"
import { classifyByRule } from "./threshold"

/**
 * TBL-7 (QCT-EVAL-4.1): class of a heating or cooling coverage (a fraction). Heating and
 * cooling are classified separately. null for a demand that is not relevant (demand = 0, OQ-22).
 */
export function classifyCoverage(coverage: number | null): CoverageClass | null {
  return coverage === null ? null : classifyByRule(coverage, COVERAGE_RULE)
}

/** TBL-11 "at least 90 %": the coverage classes that satisfy the Promising criterion. */
export function coversAtLeast90(coverage: CoverageClass): boolean {
  return coverage === "feasible" || coverage === "conditionally_feasible"
}

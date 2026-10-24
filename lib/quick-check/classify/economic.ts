import { ECONOMIC_RULE, type EconomicClass } from "./rules.config"
import { classifyByRule } from "./threshold"

/**
 * OQ-21: the economic assessment of TBL-11 from E = R_overall / (C_annual + C_el + C_O&M).
 * null when E cannot be computed (no annual costs); the overall rule treats that as not
 * favorable and not clearly unfavorable.
 */
export function classifyEconomic(ratio: number | null): EconomicClass | null {
  return ratio === null ? null : classifyByRule(ratio, ECONOMIC_RULE)
}

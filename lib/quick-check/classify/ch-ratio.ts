import { CH_RATIO_RULE, type ChRatioClass } from "./rules.config"
import { classifyByRule } from "./threshold"

/**
 * TBL-10 (QCT-EVAL-4.4): class of the cooling-to-heating ratio (0–1, OQ-12). It informs the
 * system configuration but does not enter the overall rule. null when not applicable.
 */
export function classifyChRatio(ratio: number | null): ChRatioClass | null {
  return ratio === null ? null : classifyByRule(ratio, CH_RATIO_RULE)
}

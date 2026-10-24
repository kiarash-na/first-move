import {
  BUILDING_DENSITY_RULE,
  CH_RATIO_RULE,
  COVERAGE_RULE,
  ECONOMIC_RULE,
  HEAT_DENSITY_RULE,
  type ThresholdRule,
} from "./rules.config"
import { classifyByRule } from "./threshold"

/** The classified indicators and the decimals the UI shows of each (coverage is a fraction: 2 = whole %). */
export const INDICATOR_DISPLAY = {
  coverage: { rule: COVERAGE_RULE, digits: 2 },
  buildingDensity: { rule: BUILDING_DENSITY_RULE, digits: 1 },
  heatDensity: { rule: HEAT_DENSITY_RULE, digits: 2 },
  chRatio: { rule: CH_RATIO_RULE, digits: 2 },
  economic: { rule: ECONOMIC_RULE, digits: 2 },
} as const

export type ClassifiedIndicator = keyof typeof INDICATOR_DISPLAY

/**
 * `value` rounded to `digits` decimals without crossing a band edge of `rule` (QCT-KF-02/03,
 * QCT-SCOPE-11): a shown number never contradicts the class shown next to it. Plain rounding
 * is used unless it lands in another class; then the value is cut toward its own class
 * (99.76 % → 99 %, not 100 % next to "Conditionally feasible"; 30.04 buildings/ha → 30.1, not
 * 30 next to "High"). The class itself always comes from the exact value.
 */
export function roundWithinClass<C extends string>(value: number, rule: ThresholdRule<C>, digits: number): number {
  const factor = 10 ** digits
  const rounded = Math.round(value * factor) / factor
  const own = classifyByRule(value, rule)
  if (classifyByRule(rounded, rule) === own) return rounded
  const toward = rounded > value ? Math.floor(value * factor) / factor : Math.ceil(value * factor) / factor
  return classifyByRule(toward, rule) === own ? toward : value
}

/** The value of a classified indicator as the UI shows it (see `roundWithinClass`). */
export function indicatorDisplayValue(indicator: ClassifiedIndicator, value: number): number {
  const { rule, digits } = INDICATOR_DISPLAY[indicator]
  return roundWithinClass<string>(value, rule as ThresholdRule<string>, digits)
}

import { BOUNDARY_TOLERANCE, type ThresholdRule } from "./rules.config"

/** The class of a value under a threshold rule: the first band it reaches, else `below`. */
export function classifyByRule<C extends string>(value: number, rule: ThresholdRule<C>): C {
  for (const band of rule.bands) {
    const reached = band.inclusive ? value >= band.min - BOUNDARY_TOLERANCE : value > band.min + BOUNDARY_TOLERANCE
    if (reached) return band.class
  }
  return rule.below
}

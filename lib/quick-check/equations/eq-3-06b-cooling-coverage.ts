// EQ-3.6b: C_{cool} = \frac{Q_{cool,supply}}{Q_{cool,total}}
import { divide } from "./divide"

/**
 * EQ-3.6b: cooling coverage (1.0 = 100 %). The supply is the sum over all selected sources
 * (OQ-11). null when there is no cooling demand: the demand is not relevant (OQ-22).
 */
export function coolingCoverage(coolingSupply: number, coolingDemandTotal: number): number | null {
  return divide(coolingSupply, coolingDemandTotal)
}

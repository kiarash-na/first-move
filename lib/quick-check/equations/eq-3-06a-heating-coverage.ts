// EQ-3.6a: C_{heat} = \frac{Q_{heat,supply}}{Q_{heat,total}}
import { divide } from "./divide"

/**
 * EQ-3.6a: heating coverage (1.0 = 100 %). The supply is the sum over all selected sources
 * (OQ-11). null when there is no heating demand: the demand is not relevant (OQ-22).
 */
export function heatingCoverage(heatingSupply: number, heatingDemandTotal: number): number | null {
  return divide(heatingSupply, heatingDemandTotal)
}

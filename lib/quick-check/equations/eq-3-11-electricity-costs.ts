// EQ-3.11: C_{el} = \sum_{i=1}^{n} \frac{Q_{heat,supply}}{COP_{H}} \cdot c_{el} + \sum_{i=1}^{n} \frac{Q_{cool,supply}}{COP_{C}} \cdot c_{el}
import { divide } from "./divide"

/** The supply and COPs of one selected source (EQ-3.8a/b; COP_H = TBL-4, COP_C = TBL-5, OQ-14). */
export interface SourceElectricityInput {
  heatingSupply: number
  heatingCop: number | null
  coolingSupply: number
  coolingCop: number | null
}

/** Q_supply / COP · c_el; no COP means no heat pump and no electricity (solar thermal, OQ-13). */
function term(supply: number, cop: number | null, electricityPrice: number): number | null {
  if (cop === null) return 0
  const electricity = divide(supply, cop)
  return electricity === null ? null : electricity * electricityPrice
}

/**
 * One source's share of EQ-3.11 in €/a (OQ-19: € not kWh). null when a COP is 0 (the
 * schema requires COP > 0).
 */
export function sourceElectricityCosts(source: SourceElectricityInput, electricityPrice: number): number | null {
  const heating = term(source.heatingSupply, source.heatingCop, electricityPrice)
  const cooling = term(source.coolingSupply, source.coolingCop, electricityPrice)
  return heating === null || cooling === null ? null : heating + cooling
}

/**
 * EQ-3.11: electricity costs of the heat pumps in €/a, summed over the selected sources
 * (OQ-11), before the PV reduction (OQ-06, `pv-reduction.ts`).
 */
export function electricityCosts(sources: readonly SourceElectricityInput[], electricityPrice: number): number | null {
  let total = 0
  for (const source of sources) {
    const costs = sourceElectricityCosts(source, electricityPrice)
    if (costs === null) return null
    total += costs
  }
  return total
}

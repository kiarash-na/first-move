// EQ-3.9b: R_{cool} = \sum_{i=1}^{n} \sum_{p=1}^{m} (N_{i,p} \cdot A \cdot p_{C,base}) + Q_{cool,total} \cdot p_{C,energy}
import type { FloorAreaCell, RevenueTerms } from "./eq-3-09a-heating-revenue"

/**
 * EQ-3.9b: annual cooling revenue in €/a. p_C,energy is the TBL-6 cooling energy price
 * (OQ-15); the base price is € per m² per year (OQ-16) and always uses N_i,p · A (OQ-05).
 */
export function coolingRevenue(
  cells: readonly FloorAreaCell[],
  basePrice: number,
  coolingDemandTotal: number,
  energyPrice: number,
): RevenueTerms {
  const base = cells.reduce((sum, cell) => sum + cell.buildings * cell.floorAreaM2 * basePrice, 0)
  const energy = coolingDemandTotal * energyPrice
  return { base, energy, total: base + energy }
}

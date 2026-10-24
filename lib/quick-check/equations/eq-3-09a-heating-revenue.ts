// EQ-3.9a: R_{heat} = \sum_{i=1}^{n} \sum_{p=1}^{m} (N_{i,p} \cdot A \cdot p_{H,base}) + Q_{heat,total} \cdot p_{H,energy}

/** One cell (i, p) of the building stock: its buildings (EQ-3.1) and TBL-3 floor area. */
export interface FloorAreaCell {
  buildings: number
  floorAreaM2: number
}

/** A revenue split into its base-price and energy-price terms (EQ-3.9a/b), in €/a. */
export interface RevenueTerms {
  base: number
  energy: number
  total: number
}

/**
 * EQ-3.9a: annual heating revenue in €/a. The base price is € per m² floor area per year
 * (OQ-16) and always uses N_i,p · A, also with a manual demand total (OQ-05); industry has
 * floor area 0 (OQ-02).
 */
export function heatingRevenue(
  cells: readonly FloorAreaCell[],
  basePrice: number,
  heatingDemandTotal: number,
  energyPrice: number,
): RevenueTerms {
  const base = cells.reduce((sum, cell) => sum + cell.buildings * cell.floorAreaM2 * basePrice, 0)
  const energy = heatingDemandTotal * energyPrice
  return { base, energy, total: base + energy }
}

// EQ-3.2d: Q_{cool,total} = \sum_{i=1}^{n} \sum_{p=1}^{m} Q_{cool,i,p}

/**
 * EQ-3.2d: total annual **cooling** demand in kWh/a (OQ-07), the sum of the EQ-3.2b demand of
 * every cell (Q_cool,i,p = EQ-3.2b of cell i, p; OQ-08). A manual total replaces it (OQ-05).
 */
export function totalCoolingDemand(cellDemands: readonly number[]): number {
  return cellDemands.reduce((sum, demand) => sum + demand, 0)
}

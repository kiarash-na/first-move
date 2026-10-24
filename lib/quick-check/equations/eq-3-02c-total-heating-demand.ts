// EQ-3.2c: Q_{heat,total} = \sum_{i=1}^{n} \sum_{p=1}^{m} Q_{heat}

/**
 * EQ-3.2c: total annual heating demand in kWh/a, the sum of the EQ-3.2a demand of every cell.
 * A manual total (QCT-IN-05) replaces this result in `run` (OQ-05).
 */
export function totalHeatingDemand(cellDemands: readonly number[]): number {
  return cellDemands.reduce((sum, demand) => sum + demand, 0)
}

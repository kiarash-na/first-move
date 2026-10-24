// EQ-3.10c: C_{i,total} = \sum_{j=1}^{n} C_{i}

/** EQ-3.10c: total supply investment in €, the sum of C_i over the selected sources (OQ-08). */
export function totalSupplyInvestment(perSource: readonly number[]): number {
  return perSource.reduce((sum, investment) => sum + investment, 0)
}

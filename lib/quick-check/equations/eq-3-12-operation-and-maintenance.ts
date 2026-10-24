// EQ-3.12: C_{O\&M} = 0.02 \cdot C_{overall}

/** EQ-3.12: annual operation and maintenance costs in €/a, 2 % of the overall investment. */
export function operationAndMaintenance(overallInvestment: number): number {
  return 0.02 * overallInvestment
}

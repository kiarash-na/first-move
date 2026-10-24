// EQ-3.10f: C_{annual} = C_{overall} \cdot a

/** EQ-3.10f: annualized investment costs in €/a. */
export function annualizedCosts(overallInvestment: number, annuity: number): number {
  return overallInvestment * annuity
}

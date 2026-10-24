// EQ-3.10b: C_{i} = c_{i} \cdot Q_{heat,supply}

/**
 * EQ-3.10b, per selected source (OQ-08, OQ-11): installation investment in € from the TBL-6
 * cost of the source in €/(kWh/a) and its EQ-3.8a heating supply. Ambient air uses 0 (OQ-18).
 */
export function supplyInvestment(costPerKwhPerYear: number, heatingSupply: number): number {
  return costPerKwhPerYear * heatingSupply
}

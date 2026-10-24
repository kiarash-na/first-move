// EQ-3.10d: C_{overall} = C_{HP} \cdot N_{total} + C_{net} + C_{i} + C_{i,total}

/** The heat-pump term C_HP · N_total of EQ-3.10d in € (N_total = entered total, R-02). */
export function heatPumpInvestment(heatPumpCost: number, totalBuildings: number): number {
  return heatPumpCost * totalBuildings
}

/**
 * EQ-3.10d as resolved by OQ-17: C_overall = C_HP · N_total + C_net + C_i,total. C_i is not
 * added a second time, because C_i,total already sums it (EQ-3.10c).
 */
export function overallInvestment(
  heatPumpCost: number,
  totalBuildings: number,
  network: number,
  supplyTotal: number,
): number {
  return heatPumpInvestment(heatPumpCost, totalBuildings) + network + supplyTotal
}

// EQ-3.9c: R_{overall} = R_{heat} + R_{cool} + p_{connect} \cdot N_{total} \cdot a

/** The connection-fee term of EQ-3.9c in €/a: the one-time fee per building, annualized by a. */
export function connectionFeeRevenue(connectionFee: number, totalBuildings: number, annuity: number): number {
  return connectionFee * totalBuildings * annuity
}

/**
 * EQ-3.9c: overall revenues in €/a. N_total is the entered total, industry included (R-02);
 * a is the annuity factor of EQ-3.10e.
 */
export function overallRevenue(
  heating: number,
  cooling: number,
  connectionFee: number,
  totalBuildings: number,
  annuity: number,
): number {
  return heating + cooling + connectionFeeRevenue(connectionFee, totalBuildings, annuity)
}

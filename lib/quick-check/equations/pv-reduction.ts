/**
 * OQ-06 (QCT-IN-09): with PV, the EQ-3.11 electricity costs are multiplied by
 * (1 − PV cost reduction). The reduction is the TBL-6 value as a fraction (30 % → 0.3, OQ-01).
 */
export function pvReducedElectricityCosts(costs: number, pvAvailable: boolean, reduction: number): number {
  return pvAvailable ? costs * (1 - reduction) : costs
}

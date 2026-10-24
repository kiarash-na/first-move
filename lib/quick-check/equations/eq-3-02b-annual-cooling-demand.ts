// EQ-3.2b: Q_{cool} = N_{i,p} \cdot q_{cool} \cdot A

/**
 * EQ-3.2b, per cell (i, p) (OQ-08): annual cooling demand in kWh/a from the buildings, the
 * TBL-2 demand per m² and the TBL-3 floor area. A dash (industry) is passed as 0 (OQ-02).
 */
export function annualCoolingDemand(buildings: number, coolingDemandPerM2: number, floorAreaM2: number): number {
  return buildings * coolingDemandPerM2 * floorAreaM2
}

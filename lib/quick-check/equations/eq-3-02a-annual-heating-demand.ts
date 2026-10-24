// EQ-3.2a: Q_{heat} = N_{i,p} \cdot q_{heat} \cdot A

/**
 * EQ-3.2a, per cell (i, p) (OQ-08): annual heating demand in kWh/a from the buildings, the
 * TBL-1 demand per m² and the TBL-3 floor area. A dash (industry) is passed as 0 (OQ-02).
 */
export function annualHeatingDemand(buildings: number, heatingDemandPerM2: number, floorAreaM2: number): number {
  return buildings * heatingDemandPerM2 * floorAreaM2
}

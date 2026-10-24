import { divide } from "./divide"

/**
 * OQ-21: economic ratio E = R_overall / (C_annual + C_el + C_O&M), revenues over annual costs.
 * TBL-11 reads it as favorable (≥ 1.0) or clearly unfavorable (< 0.7) (`classify/economic.ts`).
 * null when the annual costs are 0.
 */
export function economicRatio(
  revenue: number,
  annualized: number,
  electricity: number,
  operationAndMaintenance: number,
): number | null {
  return divide(revenue, annualized + electricity + operationAndMaintenance)
}

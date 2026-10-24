// EQ-3.8b: Q_{cool,supply} = Q_{cool,available} \cdot \frac{COP}{COP + 1}
import { divide } from "./divide"

/**
 * EQ-3.8b, per source (OQ-11): cooling supply in kWh/a from the TBL-5 capacity and the source's
 * TBL-5 COP (OQ-14). A dash row (waste heat, solar thermal) has capacity 0, so its supply is 0
 * (OQ-13); as in EQ-3.8a, a missing COP means no heat pump (supply = capacity).
 */
export function coolingSupply(available: number, cop: number | null): number | null {
  if (cop === null) return available
  const factor = divide(cop, cop + 1)
  return factor === null ? null : available * factor
}

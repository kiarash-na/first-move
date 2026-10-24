// EQ-3.8a: Q_{heat,supply} = Q_{heat,available} \cdot \frac{COP}{COP - 1}
import { divide } from "./divide"

/**
 * EQ-3.8a, per source (OQ-11): heat delivered in kWh/a from the TBL-4 capacity extracted from
 * the source and the source's TBL-4 COP (OQ-14). A source without COP (solar thermal) has no
 * heat pump: supply = capacity (OQ-13). null when COP = 1 (the schema requires COP > 1).
 */
export function heatingSupply(available: number, cop: number | null): number | null {
  if (cop === null) return available
  const factor = divide(cop, cop - 1)
  return factor === null ? null : available * factor
}

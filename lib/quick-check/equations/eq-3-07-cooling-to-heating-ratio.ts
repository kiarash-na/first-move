// EQ-3.7: no equation in the source (latex: null); the formula is the OQ-12 answer
import { divide } from "./divide"

/**
 * EQ-3.7 / OQ-12: CH = min(Q_cool,total, Q_heat,total) / max(Q_cool,total, Q_heat,total),
 * always 0–1. null when both demands are 0 (not applicable).
 */
export function coolingToHeatingRatio(coolingDemandTotal: number, heatingDemandTotal: number): number | null {
  return divide(Math.min(coolingDemandTotal, heatingDemandTotal), Math.max(coolingDemandTotal, heatingDemandTotal))
}

export type DominantDemand = "heating" | "cooling" | "equal"

/** The larger demand, which the UI names next to the ratio (OQ-12); null when both are 0. */
export function dominantDemand(coolingDemandTotal: number, heatingDemandTotal: number): DominantDemand | null {
  if (coolingDemandTotal === 0 && heatingDemandTotal === 0) return null
  if (heatingDemandTotal === coolingDemandTotal) return "equal"
  return heatingDemandTotal > coolingDemandTotal ? "heating" : "cooling"
}

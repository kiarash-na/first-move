// EQ-3.10a: C_{net} = c_{net} \cdot l_{total}

/** EQ-3.10a: network investment in € (TBL-6 cost per m · network length, entered or estimated). */
export function networkInvestment(costPerMeter: number, networkLength: number): number {
  return costPerMeter * networkLength
}

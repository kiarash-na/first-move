// EQ-3.10e: a = \frac{{(1 + i)}^{p} \cdot i}{{(1 + i)}^{p} - 1}
import { divide } from "./divide"

/**
 * EQ-3.10e: annuity factor for the interest rate i (a fraction, OQ-01) and the depreciation
 * period p in years (OQ-08). At i = 0 the formula is 0/0; its limit 1/p is used (straight
 * repayment). null when p = 0 (the schema requires p ≥ 1).
 */
export function annuityFactor(interestRate: number, years: number): number | null {
  if (interestRate === 0) return divide(1, years)
  const growth = (1 + interestRate) ** years
  return divide(growth * interestRate, growth - 1)
}

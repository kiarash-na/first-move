/**
 * Guarded division for the equations: null when the denominator is 0 (or the quotient is not
 * finite), so a ratio without a base is "not applicable" instead of `Infinity` or `NaN`.
 */
export function divide(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null
  const quotient = numerator / denominator
  return Number.isFinite(quotient) ? quotient : null
}

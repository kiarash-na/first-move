// EQ-3.4b: l_{total} = l_{spec} \cdot \frac{A_{proj}}{{10}^{4}}

/**
 * EQ-3.4b: estimated total network length in m (specific length in m/ha · area in ha). An
 * entered network length replaces this result in `run` (QCT-IN-08).
 */
export function totalNetLength(specificLength: number, projectAreaM2: number): number {
  return specificLength * (projectAreaM2 / 10 ** 4)
}

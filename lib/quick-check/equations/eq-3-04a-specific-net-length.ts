// EQ-3.4a: l_{spec} = \frac{171.22}{1 + 8.817 \cdot e^{-0.549 \cdot N_{ha}}}

/**
 * EQ-3.4a: specific network length in m/ha. N_ha is the building density ρ_building of EQ-3.3
 * (OQ-09). Used only when no network length is entered (QCT-IN-08). The denominator is ≥ 1.
 */
export function specificNetLength(buildingsPerHectare: number): number {
  return 171.22 / (1 + 8.817 * Math.exp(-0.549 * buildingsPerHectare))
}

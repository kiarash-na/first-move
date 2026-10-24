/**
 * Classification thresholds (TBL-7..10 and the economic rule of OQ-21), declared once. They
 * are fixed (D-10: no playground). Boundaries follow OQ-20: lower bound inclusive, no gaps,
 * except "Above 30" / "Above 1.5", which stay exclusive. `rules.config.test.ts` checks every
 * number against the generated tables.
 */

/** One class: the value belongs to it from `min` up (`inclusive`: ≥ min, else > min). */
export interface Band<C extends string> {
  readonly class: C
  readonly min: number
  readonly inclusive: boolean
}

/** Bands from the highest class down; a value under every band gets `below`. */
export interface ThresholdRule<C extends string> {
  readonly bands: readonly Band<C>[]
  readonly below: C
}

/**
 * Float tolerance at a boundary, so that a computed 0.8999999999999999 counts as 90 %. It is
 * rounding noise only, far below anything the UI shows.
 */
export const BOUNDARY_TOLERANCE = 1e-9

export const COVERAGE_CLASSES = ["feasible", "conditionally_feasible", "limited_feasibility", "not_feasible"] as const
export type CoverageClass = (typeof COVERAGE_CLASSES)[number]

/** TBL-7 on coverage as a fraction (1.0 = 100 %): ≥ 100 / ≥ 90 / ≥ 70 / < 70 % (OQ-20). */
export const COVERAGE_RULE: ThresholdRule<CoverageClass> = {
  bands: [
    { class: "feasible", min: 1, inclusive: true },
    { class: "conditionally_feasible", min: 0.9, inclusive: true },
    { class: "limited_feasibility", min: 0.7, inclusive: true },
  ],
  below: "not_feasible",
}

/** High, medium or low: the classes of TBL-8 (building density) and TBL-9 (heat density). */
export const DENSITY_CLASSES = ["high", "medium", "low"] as const
export type DensityClass = (typeof DENSITY_CLASSES)[number]

/** TBL-8 in buildings/ha: > 30 / ≥ 10 / < 10 (OQ-20). */
export const BUILDING_DENSITY_RULE: ThresholdRule<DensityClass> = {
  bands: [
    { class: "high", min: 30, inclusive: false },
    { class: "medium", min: 10, inclusive: true },
  ],
  below: "low",
}

/** TBL-9 in MWh/m (ρ_heat ÷ 1000, OQ-10): > 1.5 / ≥ 0.5 / < 0.5 (OQ-20). */
export const HEAT_DENSITY_RULE: ThresholdRule<DensityClass> = {
  bands: [
    { class: "high", min: 1.5, inclusive: false },
    { class: "medium", min: 0.5, inclusive: true },
  ],
  below: "low",
}

export const CH_RATIO_CLASSES = ["balanced", "partially_balanced", "unbalanced"] as const
export type ChRatioClass = (typeof CH_RATIO_CLASSES)[number]

/** TBL-10 on CH (0–1, OQ-12): ≥ 0.8 / ≥ 0.3 / < 0.3 (OQ-20). */
export const CH_RATIO_RULE: ThresholdRule<ChRatioClass> = {
  bands: [
    { class: "balanced", min: 0.8, inclusive: true },
    { class: "partially_balanced", min: 0.3, inclusive: true },
  ],
  below: "unbalanced",
}

export const ECONOMIC_CLASSES = ["favorable", "unclear", "clearly_unfavorable"] as const
export type EconomicClass = (typeof ECONOMIC_CLASSES)[number]

/** OQ-21 on E = R_overall / (C_annual + C_el + C_O&M): ≥ 1.0 favorable, < 0.7 clearly unfavorable. */
export const ECONOMIC_RULE: ThresholdRule<EconomicClass> = {
  bands: [
    { class: "favorable", min: 1, inclusive: true },
    { class: "unclear", min: 0.7, inclusive: true },
  ],
  below: "clearly_unfavorable",
}

export const DENSITY_CATEGORIES = ["rural", "sub_urban", "urban"] as const
export type DensityCategory = (typeof DENSITY_CATEGORIES)[number]

/** OQ-04: the read-only category (QCT-IN-03) of each TBL-8 class. */
export const DENSITY_CATEGORY_OF: Record<DensityClass, DensityCategory> = {
  low: "rural",
  medium: "sub_urban",
  high: "urban",
}

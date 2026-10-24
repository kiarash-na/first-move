import type { SourceKey } from "@/lib/project/catalog/sources"
import { coversAtLeast90 } from "./classify/coverage"
import type { CoverageClass, DensityClass, EconomicClass } from "./classify/rules.config"

/**
 * The factors behind the overall result (QCT-KF-01, QCT-KF-05), in display order: the forced
 * triggers first, then economics, coverage per demand (KF-04) and the two densities.
 */
export const DRIVER_IDS = [
  "industry",
  "unknown_sources",
  "economics",
  "heating_coverage",
  "cooling_coverage",
  "heat_density",
  "building_density",
] as const
export type DriverId = (typeof DRIVER_IDS)[number]

export type DriverEffect = "supporting" | "limiting"

export interface Driver {
  id: DriverId
  effect: DriverEffect
  /** The indicator's class (TBL-7..9, OQ-21), or null for the forced triggers. */
  classification: CoverageClass | DensityClass | EconomicClass | null
  /** The indicator's value (coverage and E as fractions, densities in buildings/ha and MWh/m). */
  value: number | null
  /** `unknown_sources`: which sources. */
  sources?: SourceKey[]
}

export interface Drivers {
  supporting: Driver[]
  limiting: Driver[]
}

export interface DriverInput {
  industry: boolean
  unknownSources: readonly SourceKey[]
  heatingCoverage: { classification: CoverageClass | null; value: number | null }
  coolingCoverage: { classification: CoverageClass | null; value: number | null }
  economics: { classification: EconomicClass | null; value: number | null }
  heatDensity: { classification: DensityClass; value: number }
  buildingDensity: { classification: DensityClass; value: number }
}

/**
 * Supporting vs limiting factors. An indicator supports the result when it meets its TBL-11
 * Promising criterion (coverage ≥ 90 %, economics favorable, density not low) and limits it
 * otherwise. Industry and unknown sources always limit (they force Further analysis). A demand
 * that is not relevant (0) and the CH ratio (TBL-10: not decisive on its own) are left out.
 */
export function keyFactors(input: DriverInput): Drivers {
  const drivers: Driver[] = []
  if (input.industry) drivers.push({ id: "industry", effect: "limiting", classification: null, value: null })
  if (input.unknownSources.length > 0) {
    drivers.push({
      id: "unknown_sources",
      effect: "limiting",
      classification: null,
      value: null,
      sources: [...input.unknownSources],
    })
  }
  const { economics } = input
  drivers.push({
    id: "economics",
    effect: economics.classification === "favorable" ? "supporting" : "limiting",
    ...economics,
  })
  for (const [id, coverage] of [
    ["heating_coverage", input.heatingCoverage],
    ["cooling_coverage", input.coolingCoverage],
  ] as const) {
    if (coverage.classification === null) continue
    drivers.push({ id, effect: coversAtLeast90(coverage.classification) ? "supporting" : "limiting", ...coverage })
  }
  for (const [id, density] of [
    ["heat_density", input.heatDensity],
    ["building_density", input.buildingDensity],
  ] as const) {
    drivers.push({ id, effect: density.classification === "low" ? "limiting" : "supporting", ...density })
  }
  return {
    supporting: drivers.filter((driver) => driver.effect === "supporting"),
    limiting: drivers.filter((driver) => driver.effect === "limiting"),
  }
}

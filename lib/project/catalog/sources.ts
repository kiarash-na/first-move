import type { CapacityCell } from "./potentials"

/**
 * Energy sources (QCT-IN-06), in table order. Keys match the rows of TBL-4/TBL-5 and the
 * `installation_costs_<key>` rows of TBL-6. Labels live in the `quick-check` dictionary
 * (`sources.<key>.label`).
 */
export const SOURCES = [
  "geothermal",
  "waste_heat",
  "ground_water",
  "surface_water",
  "solar_thermal",
  "ambient_air",
] as const

export type SourceKey = (typeof SOURCES)[number]

export type Application = "heating" | "cooling"

/**
 * The TBL-4 (heating) and TBL-5 (cooling) cells that hold a default value. A dash means no
 * default for that source and application (QCT-REF-1.3): solar thermal has no COP, and waste
 * heat and solar thermal supply no cooling (OQ-13). Only these cells can be overridden (D-10).
 * A test checks this against the YAML.
 */
export const SOURCE_CELLS: Record<SourceKey, Record<Application, readonly CapacityCell[]>> = {
  geothermal: { heating: ["low", "medium", "high", "cop"], cooling: ["low", "medium", "high", "cop"] },
  waste_heat: { heating: ["low", "medium", "high", "cop"], cooling: [] },
  ground_water: { heating: ["low", "medium", "high", "cop"], cooling: ["low", "medium", "high", "cop"] },
  surface_water: { heating: ["low", "medium", "high", "cop"], cooling: ["low", "medium", "high", "cop"] },
  solar_thermal: { heating: ["low", "medium", "high"], cooling: [] },
  ambient_air: { heating: ["low", "medium", "high", "cop"], cooling: ["low", "medium", "high", "cop"] },
}

export function hasCell(source: SourceKey, application: Application, cell: CapacityCell): boolean {
  return SOURCE_CELLS[source][application].includes(cell)
}

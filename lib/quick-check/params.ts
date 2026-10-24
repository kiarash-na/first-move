import { BUILDING_TYPES, type BuildingType } from "@/lib/project/catalog/building-types"
import { CONSTRUCTION_PERIODS, type ConstructionPeriod } from "@/lib/project/catalog/construction-periods"
import {
  ECONOMIC_PARAMETER_INFO,
  ECONOMIC_PARAMETERS,
  type EconomicParameter,
} from "@/lib/project/catalog/economic-parameters"
import { CAPACITY_CELLS, type CapacityCell } from "@/lib/project/catalog/potentials"
import { SOURCES, type Application, type SourceKey } from "@/lib/project/catalog/sources"
import type { ParameterOverrides } from "@/lib/project/schema/overrides"
import { buildingTableValue, capacityTableValue, economicTableValue } from "./reference"

/** TBL-1..3 for one cell, in equation units. A dash (industry) counts as 0 (OQ-02). */
export interface BuildingParameters {
  /** q_heat, TBL-1, kWh/m² per year. */
  heatingDemandPerM2: number
  /** q_cool, TBL-2, kWh/m² per year. */
  coolingDemandPerM2: number
  /** A, TBL-3, m² per building. */
  floorAreaM2: number
  /** False for the industry row, which has no defaults (OQ-02). */
  hasDefaults: boolean
}

/** One TBL-4/5 row: capacity per level in kWh/a and the COP. null = dash, no default (OQ-13). */
export type CapacityRow = Record<CapacityCell, number | null>

/**
 * The parameters the engine uses (PLAN-DASH-05 step 3): TBL-1..6 defaults plus the project's
 * overrides of TBL-4/5/6 (D-10). TBL-1..3 and the thresholds TBL-7..11 cannot be overridden.
 */
export interface EffectiveParameters {
  buildings: Record<BuildingType, Record<ConstructionPeriod, BuildingParameters>>
  heating: Record<SourceKey, CapacityRow>
  cooling: Record<SourceKey, CapacityRow>
  /**
   * TBL-6 in equation units: `%` rows (PV cost reduction, interest rate) as fractions (OQ-01);
   * the ambient-air installation cost dash as 0 (OQ-18).
   */
  economic: Record<EconomicParameter, number>
  /** Any override is set: results carry the "Custom parameters" badge (D-10). */
  isCustom: boolean
  /** Registry ids of the overrides in use (`quickCheck.overrides.economic.interest_rate`). */
  customFields: string[]
}

/**
 * The one place where a percentage becomes a fraction (OQ-01): 30 → 0.3. Used for the TBL-6
 * `%` rows here and for the share grid in `inputs.ts`.
 */
export function fromPercent(value: number): number {
  return value / 100
}

const PERCENT_ROWS = new Set(ECONOMIC_PARAMETERS.filter((key) => ECONOMIC_PARAMETER_INFO[key].unit === "%"))

function buildingParameters(type: BuildingType, period: ConstructionPeriod): BuildingParameters {
  const heating = buildingTableValue("TBL-1", type, period)
  const cooling = buildingTableValue("TBL-2", type, period)
  const area = buildingTableValue("TBL-3", type, period)
  return {
    heatingDemandPerM2: heating ?? 0,
    coolingDemandPerM2: cooling ?? 0,
    floorAreaM2: area ?? 0,
    hasDefaults: heating !== null && cooling !== null && area !== null,
  }
}

function capacityRows(
  application: Application,
  overrides: ParameterOverrides["heating"],
  custom: string[],
): Record<SourceKey, CapacityRow> {
  const rows = {} as Record<SourceKey, CapacityRow>
  for (const source of SOURCES) {
    const row = {} as CapacityRow
    for (const cell of CAPACITY_CELLS) {
      const override = overrides[source][cell]
      if (override !== null) custom.push(`quickCheck.overrides.${application}.${source}.${cell}`)
      row[cell] = override ?? capacityTableValue(application, source, cell)
    }
    rows[source] = row
  }
  return rows
}

/** Effective parameters for a project's overrides (`project.quickCheck.overrides`). */
export function effectiveParameters(overrides: ParameterOverrides): EffectiveParameters {
  const customFields: string[] = []
  const buildings = Object.fromEntries(
    BUILDING_TYPES.map((type) => [
      type,
      Object.fromEntries(CONSTRUCTION_PERIODS.map((period) => [period, buildingParameters(type, period)])),
    ]),
  ) as EffectiveParameters["buildings"]
  const heating = capacityRows("heating", overrides.heating, customFields)
  const cooling = capacityRows("cooling", overrides.cooling, customFields)
  const economic = {} as Record<EconomicParameter, number>
  for (const key of ECONOMIC_PARAMETERS) {
    const override = overrides.economic[key]
    if (override !== null) customFields.push(`quickCheck.overrides.economic.${key}`)
    const value = override ?? economicTableValue(key) ?? 0
    economic[key] = PERCENT_ROWS.has(key) ? fromPercent(value) : value
  }
  return { buildings, heating, cooling, economic, isCustom: customFields.length > 0, customFields }
}

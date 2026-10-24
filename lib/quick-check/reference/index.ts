import type { BuildingType } from "@/lib/project/catalog/building-types"
import { PERIOD_COLUMNS, type ConstructionPeriod } from "@/lib/project/catalog/construction-periods"
import type { EconomicParameter } from "@/lib/project/catalog/economic-parameters"
import type { CapacityCell } from "@/lib/project/catalog/potentials"
import type { Application, SourceKey } from "@/lib/project/catalog/sources"
import { TBL_1 } from "./table-01-annual-heating-demand.gen"
import { TBL_2 } from "./table-02-annual-cooling-demand.gen"
import { TBL_3 } from "./table-03-average-floor-area.gen"
import { TBL_4 } from "./table-04-heating-capacity-per-source.gen"
import { TBL_5 } from "./table-05-cooling-capacity-per-source.gen"
import { TBL_6 } from "./table-06-economic-parameters.gen"

/**
 * Typed access to the reference tables generated from `docs/10_quick-check-tool/_reference/`
 * (`pnpm gen:reference`). Values are exactly as in the YAML; `null` is a printed dash.
 */
export { QCT_REF_TYPES } from "./building-types.gen"
export { SYMBOLS } from "./symbols.gen"
export { TBL_1, TBL_2, TBL_3, TBL_4, TBL_5, TBL_6 }
export { TBL_7 } from "./table-07-classification-supply-coverage.gen"
export { TBL_8 } from "./table-08-classification-building-density.gen"
export { TBL_9 } from "./table-09-classification-heat-density.gen"
export { TBL_10 } from "./table-10-classification-ch-ratio.gen"
export { TBL_11 } from "./table-11-overall-result-classification.gen"

/** TBL-1..3: one value per building type and construction period. */
export type BuildingTable = "TBL-1" | "TBL-2" | "TBL-3"

const BUILDING_TABLES = { "TBL-1": TBL_1, "TBL-2": TBL_2, "TBL-3": TBL_3 } as const

/**
 * The TBL-1 (q_heat, kWh/m²a), TBL-2 (q_cool, kWh/m²a) or TBL-3 (A, m²) value of one cell,
 * or null for a dash (industry, OQ-02). The column is found by its printed header (OQ-03).
 */
export function buildingTableValue(table: BuildingTable, type: BuildingType, period: ConstructionPeriod): number | null {
  const data = BUILDING_TABLES[table]
  const column = (data.columns as readonly string[]).indexOf(PERIOD_COLUMNS[period])
  return data.rows[type].value[column] ?? null
}

const CAPACITY_TABLES = { heating: TBL_4, cooling: TBL_5 } as const

/** A TBL-4 (heating) or TBL-5 (cooling) cell: capacity in kWh/a or COP; null for a dash (OQ-13). */
export function capacityTableValue(application: Application, source: SourceKey, cell: CapacityCell): number | null {
  return CAPACITY_TABLES[application].rows[source][cell]
}

/** The TBL-6 default of one row, in the printed unit (`%` as percent); null for a dash (OQ-18). */
export function economicTableValue(key: EconomicParameter): number | null {
  const row = TBL_6.parameters.find((parameter) => parameter.key === key)
  if (!row) throw new Error(`TBL-6 has no row ${key}`)
  return row.value
}

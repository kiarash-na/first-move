import { z } from "zod"
import { ECONOMIC_PARAMETERS } from "@/lib/project/catalog/economic-parameters"
import { CAPACITY_CELLS, type CapacityCell } from "@/lib/project/catalog/potentials"
import { hasCell, SOURCES, type Application } from "@/lib/project/catalog/sources"
import { ECONOMIC_LIMITS, LIMITS } from "@/lib/project/fields/limits"
import { keyedObject, limitedNumber } from "./common"

const COP_LIMIT = { heating: LIMITS.heatingCop, cooling: LIMITS.coolingCop } as const

/**
 * One TBL-4/5 cell: a number overrides the default, null keeps it. A cell without a default
 * (a dash, OQ-13) cannot be overridden and must stay null.
 */
function cellSchema(application: Application, cell: CapacityCell) {
  const limit = cell === "cop" ? COP_LIMIT[application] : LIMITS.capacityKwhPerYear
  return limitedNumber(limit).nullable()
}

function capacityTable(application: Application) {
  return keyedObject(SOURCES, (source) =>
    keyedObject(CAPACITY_CELLS, (cell) => (hasCell(source, application, cell) ? cellSchema(application, cell) : z.null())),
  )
}

/**
 * "Play with parameters" (D-10): overrides of TBL-4 (heating), TBL-5 (cooling) and TBL-6
 * (economic). null keeps the default; any number marks results as custom. TBL-1..3 and the
 * thresholds of TBL-7..11 cannot be overridden.
 */
export const overridesSchema = z
  .strictObject({
    heating: capacityTable("heating").meta({
      description: "TBL-4 overrides per source: capacity in kWh/a per level, and COP (> 1). null = default.",
    }),
    cooling: capacityTable("cooling").meta({
      description: "TBL-5 overrides per source: capacity in kWh/a per level, and COP (> 0). Dash cells must stay null.",
    }),
    economic: keyedObject(ECONOMIC_PARAMETERS, (key) => limitedNumber(ECONOMIC_LIMITS[key]).nullable()).meta({
      description: "TBL-6 overrides in the units of TBL-6; % values as percent (0-100). null = default.",
    }),
  })
  .meta({ description: "Parameter overrides (D-10). Any non-null value marks results as custom." })

export type ParameterOverrides = z.infer<typeof overridesSchema>

import { z } from "zod"
import { BUILDING_TYPES } from "@/lib/project/catalog/building-types"
import { CONSTRUCTION_PERIODS } from "@/lib/project/catalog/construction-periods"
import { LIMITS } from "@/lib/project/fields/limits"
import { keyedObject, limitedNumber } from "./common"

/** One cell of the share grid in % (0–100) as typed, or null while empty (D-31, OQ-01). */
export const shareSchema = limitedNumber(LIMITS.share).nullable()

/** QCT-IN-04: share per building type (rows) and construction period (columns). */
export const shareGridSchema = keyedObject(BUILDING_TYPES, () =>
  keyedObject(CONSTRUCTION_PERIODS, () => shareSchema),
).meta({
  description:
    "Share of buildings in % per building type and construction period (QCT-IN-04). Empty cells are null. All shares must add up to 100, otherwise the Quick Check is incomplete. Industry > 0 forces 'Further analysis required'.",
})

/** The building stock of the project area (QCT-IN-01, QCT-IN-02, QCT-IN-04). */
export const buildingsSchema = z
  .strictObject({
    total: limitedNumber(LIMITS.buildingsTotal)
      .nullable()
      .meta({ description: "Total number of buildings, industry included (QCT-IN-01)." }),
    areaM2: limitedNumber(LIMITS.areaM2)
      .nullable()
      .meta({ description: "Total project area in m² (QCT-IN-02)." }),
    shares: shareGridSchema,
  })
  .meta({ description: "Building stock, shared by both modules." })

export type Buildings = z.infer<typeof buildingsSchema>
export type ShareGrid = z.infer<typeof shareGridSchema>

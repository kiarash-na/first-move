import { classifyBuildingDensity, densityCategory } from "./classify/building-density"
import type { DensityCategory, DensityClass } from "./classify/rules.config"
import { buildingDensity } from "./equations/eq-3-03-building-density"

export interface AreaPreview {
  /** EQ-3.3 in buildings/ha. */
  buildingDensity: number
  /** TBL-8 class. */
  densityClass: DensityClass
  /** The read-only rural / sub-urban / urban category (QCT-IN-03, OQ-04). */
  densityCategory: DensityCategory
}

/**
 * What the area step can show before the rest of the Quick Check is filled in: the building
 * density (EQ-3.3), its TBL-8 class and the OQ-04 category. Null until both inputs are set.
 */
export function areaPreview(totalBuildings: number | null, projectAreaM2: number | null): AreaPreview | null {
  if (totalBuildings === null || projectAreaM2 === null) return null
  const density = buildingDensity(totalBuildings, projectAreaM2)
  if (density === null) return null
  const densityClass = classifyBuildingDensity(density)
  return { buildingDensity: density, densityClass, densityCategory: densityCategory(densityClass) }
}

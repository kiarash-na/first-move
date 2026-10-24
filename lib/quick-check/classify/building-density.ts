import { BUILDING_DENSITY_RULE, DENSITY_CATEGORY_OF, type DensityCategory, type DensityClass } from "./rules.config"
import { classifyByRule } from "./threshold"

/** TBL-8 (QCT-EVAL-4.2): class of the building density ρ_building in buildings/ha. */
export function classifyBuildingDensity(buildingsPerHectare: number): DensityClass {
  return classifyByRule(buildingsPerHectare, BUILDING_DENSITY_RULE)
}

/** OQ-04 (QCT-IN-03): the read-only rural / sub-urban / urban category of a TBL-8 class. */
export function densityCategory(densityClass: DensityClass): DensityCategory {
  return DENSITY_CATEGORY_OF[densityClass]
}

/**
 * Six illustrative example projects, both modules filled (D-04, OQ-23). Picking one copies it:
 * `getProjectStore().addCopy(localizeExample(example, lang))`. Label them "Illustrative inputs
 * only" (DESIGN-TOKENS section 6) wherever they appear.
 */
import { housingCooperatives } from "./housing-cooperatives"
import { newBuildQuarter } from "./new-build-quarter"
import { officeRetailBlock } from "./office-retail-block"
import { ruralVillageHotel } from "./rural-village-hotel"
import { schoolKindergartenFlats } from "./school-kindergarten-flats"
import { thermalSpaHotels } from "./thermal-spa-hotels"
import { text, type ExampleDefinition } from "./types"

/** In demo order: the table of PLAN-DASH-06. */
export const EXAMPLES: readonly ExampleDefinition[] = [
  ruralVillageHotel,
  schoolKindergartenFlats,
  housingCooperatives,
  thermalSpaHotels,
  newBuildQuarter,
  officeRetailBlock,
]

export const EXAMPLE_IDS = EXAMPLES.map((example) => example.id)

/** The label every example carries (DESIGN-TOKENS section 6). */
export const ILLUSTRATIVE_LABEL = text("Illustrative inputs only")

export function getExample(id: string): ExampleDefinition | undefined {
  return EXAMPLES.find((example) => example.id === id)
}

export { EXAMPLE_DATE, localizeExample } from "./localize"
export { text, type ExampleBusinessPlan, type ExampleDefinition, type ExampleShares, type Localized } from "./types"

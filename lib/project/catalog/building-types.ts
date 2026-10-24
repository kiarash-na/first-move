/**
 * Building types (QCT-REF-TYPES, `building-types.yaml`), in table order. The keys match the
 * rows of TBL-1..3. Labels and descriptions live in the `quick-check` dictionary
 * (`buildingTypes.<key>`).
 */
export const BUILDING_TYPES = ["residential", "category_a", "category_b", "category_c", "industry"] as const

export type BuildingType = (typeof BUILDING_TYPES)[number]

/**
 * Industry has no default values (TBL-1..3 print "-"). It is selectable; any share > 0 forces
 * "Further analysis required" (QCT-RULE-INDUSTRY, OQ-02).
 */
export const INDUSTRY = "industry" satisfies BuildingType

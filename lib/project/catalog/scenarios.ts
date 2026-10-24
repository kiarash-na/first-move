/**
 * Business Plan use cases: the four V01 scenarios as presets (BM-SCN-01..04) or a custom use
 * case (OQ-25, BM-SCOPE-05). Labels live in the `business-plan` dictionary (`scenarios.<id>`).
 */
export const SCENARIO_IDS = ["BM-SCN-01", "BM-SCN-02", "BM-SCN-03", "BM-SCN-04", "custom"] as const

export type ScenarioId = (typeof SCENARIO_IDS)[number]

/**
 * The Quick Check engine (PLAN-DASH-05): `run(project)` returns every value, class, the overall
 * result with its reasons and drivers, and the flags the UI needs. Pure TypeScript, no React,
 * no storage, no network. Methodology §3–4 exactly, with the resolved OQ answers.
 */
export { areaPreview, type AreaPreview } from "./area-preview"
export * from "./classify"
export { DRIVER_IDS, keyFactors, type Driver, type DriverEffect, type DriverId, type Drivers } from "./drivers"
export * from "./equations"
export {
  explainResult,
  RESULT_EXPLAIN,
  STEP_EXPLAIN,
  type CalcKey,
  type ExplainedResult,
  type ExplainedStep,
  type Explanation,
} from "./explain/map"
export { FORMULA_IDS, FORMULAS, formulaNameKey, type Formula, type FormulaId } from "./explain/formulas"
export { readInputs, type EngineInputs, type SelectedSource } from "./inputs"
export {
  DEMANDS,
  overallResult,
  REASON_CODES,
  RESULT_LEVELS,
  type Demand,
  type OverallAssessment,
  type OverallReason,
  type OverallRuleInput,
  type ReasonCode,
  type ResultLevel,
  type RuleStep,
} from "./overall-rule"
export { effectiveParameters, fromPercent, type BuildingParameters, type CapacityRow, type EffectiveParameters } from "./params"
export { run } from "./run"
export type * from "./types"

/**
 * The Business Plan module's logic (PLAN-DASH-10): scenario presets, guiding prompts, progress,
 * pitch readiness and the Quick Check prefill. Pure TypeScript, no React, no storage.
 */
export { isFieldFilled, isTextFilled, ROW_REQUIRED, rowsStatus, type RowListId, type RowsStatus } from "./filled"
export {
  isPresetScenario,
  PRESET_FIELDS,
  PRESET_SCENARIOS,
  presetFacts,
  presetFieldsOf,
  presetOverwrites,
  presetPatch,
  type PresetField,
  type PresetScenario,
  type PresetTexts,
} from "./presets"
export { allProgress, OPTIONAL_FIELDS, overallProgress, stepProgress, type StepProgress } from "./progress"
export { PROMPTS, promptsFor, type Prompt, type PromptKind } from "./prompts"
export { qcPrefill, sharedSiteData, type QcNumbers, type QcPrefill, type SharedSiteData } from "./qc-prefill"
export { CHECKS, JURY_CRITERIA, PITCH_SECTIONS, type CheckId, type JuryCriterionId, type PitchSectionId, type ReadinessCheck } from "./readiness-checks"
export {
  nextCheck,
  pitchReadiness,
  type CheckResult,
  type PitchReadiness,
  type PitchReadinessLevel,
  type ReadinessGroup,
} from "./readiness"

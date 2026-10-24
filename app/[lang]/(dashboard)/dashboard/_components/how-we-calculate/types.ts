import type { TableId } from "@/lib/project/catalog/references"
import type { CalcKey, FormulaId } from "@/lib/quick-check"

/**
 * What a "How we calculate" shows (D-33): a `calc` sentence, the formulas in order and the
 * default tables. `STEP_EXPLAIN[step]` and `explainResult(key, flags)` return this shape.
 */
export interface CalcSource {
  text?: CalcKey
  formulas: readonly FormulaId[]
  tables?: readonly TableId[]
}

/** Accent of the left rule: cyan for Quick Check, orange for Business Plan (DESIGN-TOKENS §1). */
export type CalcTone = "cool" | "hot"

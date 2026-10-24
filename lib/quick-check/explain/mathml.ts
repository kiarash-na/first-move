import { FORMULA_MATHML as GENERATED } from "./equations-mathml.gen"
import type { FormulaId } from "./formulas"

/** The pre-rendered MathML of a formula (KaTeX `output: "mathml"`) and of its output symbol. */
export interface FormulaMathml {
  /** `<math display="block">`, or `null` when the source has no equation (EQ-3.7). */
  mathml: string | null
  outputMathml: string | null
}

/**
 * MathML of every formula, for "How we calculate" (D-33). About 30 kB, so it is not part of the
 * `@/lib/quick-check` barrel: only the explanation body imports it, and that body loads when a
 * disclosure or popover opens (`lazy-calc-explanation.tsx`).
 */
export const FORMULA_MATHML: Record<FormulaId, FormulaMathml> = GENERATED

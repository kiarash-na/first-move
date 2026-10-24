import { EQUATIONS, RESOLVED_FORMULAS } from "./equations.gen"

/** An equation of methodology §3 (`EQ-3.4a`) or a formula from a resolved OQ answer (`OQ-12`). */
export type FormulaId = keyof typeof EQUATIONS | keyof typeof RESOLVED_FORMULAS

/**
 * One formula for "How we calculate" (D-33), pre-rendered at `pnpm gen:reference` time so no
 * math library ships to the client. EQ-3.7 has no equation in the source (`latex` null).
 */
export interface Formula {
  id: FormulaId
  /** Docs file prefix (`eq-03-04a`, `oq-12`); also the `calc` dictionary key `formulas.<slug>`. */
  slug: string
  /** Title of the docs file (internal docs are English; the UI shows `formulas.<slug>`). */
  title: string
  /** The docs file the formula comes from. */
  file: string
  /** Output symbol as LaTeX and MathML (`l_{spec}`). */
  output: string | null
  outputMathml: string | null
  /** The `latex:` of the docs file, and its MathML (KaTeX `output: "mathml"`). */
  latex: string | null
  mathml: string | null
  inputs: readonly string[]
  tables: readonly string[]
  flags: readonly string[]
}

export const FORMULAS: Record<FormulaId, Formula> = { ...EQUATIONS, ...RESOLVED_FORMULAS }

/** Every formula id: the equations in methodology order, then the resolved OQ formulas (OQ-06, OQ-12, OQ-17, OQ-21). */
export const FORMULA_IDS = Object.keys(FORMULAS) as FormulaId[]

/** The `calc` dictionary key of a formula's name. */
export function formulaNameKey(id: FormulaId): `formulas.${string}` {
  return `formulas.${FORMULAS[id].slug}`
}

/**
 * "How we calculate" (D-33), shared by the Quick Check, Overview and Business Plan pages.
 * `CalcExplanation` and `FormulaMath` are not re-exported: they carry the MathML and load only
 * when a disclosure or popover opens (`lazy-calc-explanation.tsx`).
 */
export { CalcInfo } from "./calc-info"
export { HowWeCalculate } from "./how-we-calculate"
export type { CalcSource, CalcTone } from "./types"

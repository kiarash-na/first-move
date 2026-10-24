import type { FormulaId } from "@/lib/quick-check"
import { FORMULA_MATHML } from "@/lib/quick-check/explain/mathml"
import { cn } from "@/lib/utils"

/**
 * The MathML of one formula. It is generated at build time from the `latex:` of the docs
 * (`pnpm gen:reference`, D-33) and never contains user data, so it is injected as HTML; only a
 * `FormulaId` is accepted, never a string (allow-listed in `no-html-rendering.test.ts`, D-14).
 * Imported only by the lazily loaded explanation body (`lazy-calc-explanation.tsx`).
 */
export function FormulaMath({ id, label, className }: { id: FormulaId; label?: string; className?: string }) {
  const mathml = FORMULA_MATHML[id].mathml
  if (!mathml) return null
  return (
    // A long formula scrolls sideways on a phone: the scroller is focusable (keyboard scrolling),
    // named after the formula, and fades at the edge that hides more of it.
    <div
      data-slot="formula-math"
      role="group"
      aria-label={label ?? id}
      tabIndex={0}
      className={cn(
        "scroll-fade-x overflow-y-hidden py-1 text-[0.9375rem] text-foreground focus-visible:-outline-offset-2 sm:text-[1.0625rem] [&_math]:m-0 [&_math]:[display:inline_math]",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: mathml }}
    />
  )
}

import { FORMULAS, type FormulaId } from "@/lib/quick-check"
import { cn } from "@/lib/utils"

/**
 * The MathML of one formula. It is generated at build time from the `latex:` of the docs
 * (`pnpm gen:reference`, D-33) and never contains user data, so it is injected as HTML; only a
 * `FormulaId` is accepted, never a string (allow-listed in `no-html-rendering.test.ts`, D-14).
 */
export function FormulaMath({ id, className }: { id: FormulaId; className?: string }) {
  const mathml = FORMULAS[id].mathml
  if (!mathml) return null
  return (
    <div
      data-slot="formula-math"
      className={cn(
        "overflow-x-auto overflow-y-hidden py-1 text-[1.0625rem] text-foreground [&_math]:m-0 [&_math]:[display:inline_math]",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: mathml }}
    />
  )
}

"use client"

import { FORMULAS, formulaNameKey } from "@/lib/quick-check"
import { lookup } from "@/lib/i18n/lookup"
import { cn } from "@/lib/utils"
import { useDictionary } from "../i18n-provider"
import { FormulaMath } from "./formula-math"
import type { CalcSource } from "./types"

/**
 * The body of "How we calculate" (D-33): the plain-language sentence, then each formula with
 * its ID, name and MathML, then the default tables. Shared by the disclosure and the popover.
 */
export function CalcExplanation({ source, compact = false }: { source: CalcSource; compact?: boolean }) {
  const calc = useDictionary("calc")
  const sentence = source.text ? lookup(calc, source.text) : null
  const tables = source.tables ?? []

  return (
    <div data-slot="calc-explanation" className="flex flex-col gap-4">
      {sentence && <p className="max-w-[64ch] text-sm leading-relaxed text-text-secondary">{sentence}</p>}
      {source.formulas.length > 0 && (
        <ol className="flex flex-col divide-y divide-border border-y border-border">
          {source.formulas.map((id) => {
            const formula = FORMULAS[id]
            return (
              <li
                key={id}
                className={cn(
                  "grid items-center gap-x-6 gap-y-1 py-3",
                  !compact && "sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]",
                )}
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-mono text-xs tracking-[0.06em] text-primary">{id}</span>
                  <span className="text-sm leading-snug text-foreground">{lookup(calc, formulaNameKey(id)) ?? formula.title}</span>
                </div>
                {formula.mathml ? (
                  <FormulaMath id={id} />
                ) : (
                  <p className="text-sm leading-snug text-muted-foreground">{calc.ui.noEquation}</p>
                )}
              </li>
            )
          })}
        </ol>
      )}
      {tables.length > 0 && (
        <p className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">
          {calc.ui.tables} · {tables.join(" · ")}
        </p>
      )}
    </div>
  )
}

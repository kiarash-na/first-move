"use client"

import { CalculatorIcon, ChevronDownIcon } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { useDictionary } from "../i18n-provider"
import { LazyCalcExplanation, preloadCalcExplanation } from "./lazy-calc-explanation"
import type { CalcSource, CalcTone } from "./types"

/**
 * "How we calculate" as a quiet disclosure, collapsed by default (D-33). Put it under each
 * Quick Check step and next to computed numbers: `<HowWeCalculate source={STEP_EXPLAIN.area} />`.
 * The body (with the MathML) loads on first open, see `lazy-calc-explanation.tsx`.
 */
export function HowWeCalculate({
  source,
  tone = "cool",
  title,
  className,
}: {
  source: CalcSource
  tone?: CalcTone
  /** Defaults to `calc.ui.title`. */
  title?: string
  className?: string
}) {
  const calc = useDictionary("calc")

  return (
    <Collapsible data-slot="how-we-calculate" className={cn("group/calc", className)}>
      <CollapsibleTrigger
        onPointerEnter={preloadCalcExplanation}
        onFocus={preloadCalcExplanation}
        className={cn(
          "inline-flex min-h-11 cursor-pointer items-center gap-2.5 font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase transition-colors duration-[180ms] hover:text-foreground",
          tone === "cool" ? "data-[state=open]:text-primary" : "data-[state=open]:text-hot",
        )}
      >
        <CalculatorIcon className="size-4" strokeWidth={1.6} aria-hidden="true" />
        {title ?? calc.ui.title}
        <ChevronDownIcon
          className="size-4 transition-transform duration-[220ms] ease-signature group-data-[state=open]/calc:rotate-180"
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0">
        <div
          className={cn(
            "mt-1 border-l-2 bg-muted/40 px-4 py-4 sm:px-5",
            tone === "cool" ? "border-primary" : "border-hot",
          )}
        >
          <LazyCalcExplanation source={source} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

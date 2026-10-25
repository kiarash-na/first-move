"use client"

import { concentration } from "@/lib/ai/plan-score/distribution"
import { formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"

/**
 * How sure Jev is about a level: the concentration of its answer (1 − normalised entropy,
 * `distribution.ts`), as text and a 2px meter in the Business Plan colour.
 */
export function ConfidenceMeter({ probabilities, className }: { probabilities: readonly number[]; className?: string }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score").results.parts
  const value = concentration(probabilities)

  return (
    <div data-slot="confidence-meter" data-value={value} title={copy.confidenceHelp} className={cn("flex w-24 shrink-0 flex-col gap-1", className)}>
      <span className="font-mono text-xs text-muted-foreground tabular-nums">
        <span className="sr-only">{copy.confidence}: </span>
        {interpolate(copy.confidenceValue, { value: formatPercent(value, lang) })}
      </span>
      <span aria-hidden="true" className="relative h-0.5 w-full bg-input">
        <span className="absolute inset-y-0 left-0 bg-hot" style={{ width: `${value * 100}%` }} />
      </span>
    </div>
  )
}

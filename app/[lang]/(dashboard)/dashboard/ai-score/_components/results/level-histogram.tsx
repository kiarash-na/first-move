"use client"

import { LEVEL_COUNT, LEVEL_IDS } from "@/lib/ai/plan-score/scale"
import { formatPercent } from "@/lib/i18n/format"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"

/**
 * A mini histogram of Jev's five level probabilities (one series, one colour) with the expected
 * level E = Σ k·p(k) as a line: its centre sits at slot E, so it falls between two bars when the
 * answer is spread. Read out as one image with every probability in its name.
 */
export function LevelHistogram({ probabilities, expected, className }: { probabilities: readonly number[]; expected: number | null; className?: string }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const values = LEVEL_IDS.map((id, level) => `${copy.labels.levels[id].name} ${formatPercent(probabilities[level] ?? 0, lang)}`).join(", ")

  return (
    <div
      role="img"
      aria-label={`${copy.results.parts.histogram}: ${values}`}
      data-slot="level-histogram"
      className={cn("relative flex h-7 w-[5.5rem] shrink-0 items-end gap-0.5 border-b border-border", className)}
    >
      {LEVEL_IDS.map((id, level) => (
        <span key={id} data-level={level} className="flex-1 bg-hot" style={{ height: `${Math.max(0, Math.min(1, probabilities[level] ?? 0)) * 100}%` }} />
      ))}
      {expected !== null && (
        <span
          data-expected
          aria-hidden="true"
          className="absolute -inset-y-1 w-0.5 -translate-x-1/2 bg-foreground"
          style={{ left: `${((expected + 0.5) / LEVEL_COUNT) * 100}%` }}
        />
      )}
    </div>
  )
}

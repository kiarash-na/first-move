"use client"

import { CheckIcon, CircleDashedIcon, EraserIcon, TriangleAlertIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ShareSum } from "@/lib/dashboard/share-sum"
import { formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../../../_components/i18n-provider"

const ICON = { empty: CircleDashedIcon, under: CircleDashedIcon, exact: CheckIcon, over: TriangleAlertIcon } as const

/**
 * The live sum of the share grid (QCT-IN-04, R-03): value, a 2px bar to 100 %, and what to do
 * next in words and icon (empty, still to assign, complete, too much). Sticks to the bottom.
 */
export function ShareSumBar({ sum, onClear }: { sum: ShareSum; onClear: () => void }) {
  const lang = useLocale()
  const copy = useDictionary("quick-check").ui.buildings
  const Icon = ICON[sum.state]
  const amount = formatPercent(Math.abs(sum.remaining) / 100, lang, { fractionDigits: 1 })
  const message = interpolate(copy.state[sum.state], { value: amount })
  const filled = Math.min(sum.sum, 100)

  return (
    <div
      data-slot="share-sum"
      data-state={sum.state}
      className="sticky bottom-3 z-10 flex flex-col gap-3 border bg-card/95 p-4 shadow-panel backdrop-blur-md sm:flex-row sm:items-center sm:gap-6 sm:px-5"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{copy.sum}</span>
          <span
            className={cn(
              "font-mono text-xl tabular-nums",
              sum.state === "exact" && "text-primary",
              sum.state === "over" && "text-hot",
            )}
          >
            {formatPercent(sum.sum / 100, lang, { fractionDigits: 1 })}
          </span>
        </div>
        <div className="relative h-0.5 w-full bg-input" aria-hidden="true">
          <div
            className={cn("absolute inset-y-0 left-0 transition-[width] duration-[240ms] ease-signature", sum.state === "over" ? "bg-hot" : "bg-primary")}
            style={{ width: `${filled}%` }}
          />
        </div>
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "flex items-center gap-1.5 text-sm leading-snug",
            sum.state === "exact" ? "text-primary" : sum.state === "over" ? "text-hot" : "text-text-secondary",
          )}
        >
          <Icon className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          {message}
        </p>
      </div>
      <Button variant="ghost" onClick={onClear} disabled={sum.state === "empty"} className="self-start sm:self-center">
        <EraserIcon strokeWidth={1.6} aria-hidden="true" />
        {copy.clear}
      </Button>
    </div>
  )
}

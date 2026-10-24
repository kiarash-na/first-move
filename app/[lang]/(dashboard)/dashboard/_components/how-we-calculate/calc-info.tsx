"use client"

import { InfoIcon } from "lucide-react"
import { useLayoutEffect, useState } from "react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useDictionary } from "../i18n-provider"
import { LazyCalcExplanation, preloadCalcExplanation } from "./lazy-calc-explanation"
import type { CalcSource } from "./types"

/**
 * The small info popover variant of "How we calculate" (D-33), for KPI cards and result values:
 * `<CalcInfo source={explainResult("heatingDemandKwh", run.flags)} label="Heating demand" />`.
 */
export function CalcInfo({
  source,
  label,
  className,
}: {
  source: CalcSource
  /** What the number is; the button reads "How we calculate this: <label>". */
  label?: string
  className?: string
}) {
  const calc = useDictionary("calc")
  const [open, setOpen] = useState(false)
  // A popover is transient: close it when Activity hides the route (preserving-ui-state guide).
  useLayoutEffect(() => () => setOpen(false), [])
  const name = label ? `${calc.ui.info}: ${label}` : calc.ui.info

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={name}
        title={name}
        onPointerEnter={preloadCalcExplanation}
        onFocus={preloadCalcExplanation}
        className={cn(
          "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center text-muted-foreground transition-colors duration-[180ms] hover:text-primary data-[state=open]:text-primary",
          className,
        )}
      >
        <InfoIcon className="size-4" strokeWidth={1.6} aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent aria-label={calc.ui.title} align="start" className="w-[min(30rem,calc(100vw-2rem))] p-5">
        <p className="mb-3 font-mono text-xs tracking-[0.06em] text-primary uppercase">{calc.ui.title}</p>
        <LazyCalcExplanation source={source} compact />
      </PopoverContent>
    </Popover>
  )
}

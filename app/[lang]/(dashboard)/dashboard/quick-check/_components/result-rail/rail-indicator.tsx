"use client"

import type { ReactNode } from "react"
import type { DriverEffect } from "@/lib/quick-check"
import { cn } from "@/lib/utils"
import { CalcInfo, type CalcSource } from "../../../_components/how-we-calculate"
import { EffectMark } from "../effect-mark"

/** One compact indicator of the live result: name, value, class, effect and its info popover (D-33). */
export function RailIndicator({
  label,
  value,
  detail,
  effect,
  explain,
  className,
}: {
  label: string
  value: ReactNode
  detail?: ReactNode
  effect: DriverEffect | null
  explain: CalcSource
  className?: string
}) {
  return (
    <div data-slot="rail-indicator" className={cn("flex items-start gap-3 py-3", className)}>
      <EffectMark effect={effect} className="mt-0.5" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{label}</span>
        <span className="font-mono text-[15px] leading-snug text-foreground tabular-nums">{value}</span>
        {detail && <span className="text-sm leading-snug text-text-secondary">{detail}</span>}
      </div>
      <CalcInfo source={explain} label={label} className="-my-2 -mr-3" />
    </div>
  )
}

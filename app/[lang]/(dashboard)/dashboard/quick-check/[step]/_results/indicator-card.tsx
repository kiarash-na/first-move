"use client"

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import type { DriverEffect } from "@/lib/quick-check"
import { CalcInfo, type CalcSource } from "../../../_components/how-we-calculate"
import { EffectMark } from "../../_components/effect-mark"

/**
 * One indicator (QCT-KF-02): value with unit, its class (TBL-8..10, OQ-21) and what the class
 * means for the project, its effect on the result and how it is calculated (D-33).
 */
export function IndicatorCard({
  id,
  icon: Icon,
  title,
  value,
  unit,
  classLabel,
  interpretation,
  effect,
  explain,
  children,
}: {
  id: string
  icon: LucideIcon
  title: string
  value: string
  unit?: string
  classLabel: string
  interpretation: string
  effect: DriverEffect | null
  explain: CalcSource
  children?: ReactNode
}) {
  return (
    <article data-slot="indicator-card" data-indicator={id} aria-labelledby={`indicator-${id}`} className="flex flex-col gap-4 bg-background p-5 sm:p-6">
      <header className="flex items-start justify-between gap-3">
        <h3 id={`indicator-${id}`} className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">
          <Icon className="size-4 text-primary" strokeWidth={1.6} aria-hidden="true" />
          {title}
        </h3>
        <CalcInfo source={explain} label={title} className="-m-2.5" />
      </header>
      <p className="flex flex-wrap items-baseline gap-x-2 font-mono text-[28px] leading-none tracking-[-0.03em] tabular-nums">
        {value}
        {unit && <span className="text-xs tracking-[0.04em] text-muted-foreground uppercase">{unit}</span>}
      </p>
      <p className="inline-flex items-center gap-2 text-[15px] leading-tight font-[480]">
        <EffectMark effect={effect} />
        {classLabel}
      </p>
      <p className="text-sm leading-relaxed text-text-secondary">{interpretation}</p>
      {children && <div className="mt-auto border-t pt-3 text-sm text-muted-foreground">{children}</div>}
    </article>
  )
}

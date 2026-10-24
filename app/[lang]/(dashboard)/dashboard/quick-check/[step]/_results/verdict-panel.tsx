"use client"

import { CheckIcon, LockIcon, ScanSearchIcon, XIcon } from "lucide-react"
import { reasonText } from "@/lib/dashboard/result-text"
import { explainResult, type QuickCheckComplete, type ResultLevel } from "@/lib/quick-check"
import { cn } from "@/lib/utils"
import { CustomParametersBadge } from "../../../_components/custom-parameters-badge"
import { CalcInfo } from "../../../_components/how-we-calculate"
import { IllustrativeBadge } from "../../../_components/illustrative-badge"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"

const LEVEL = {
  promising: { icon: CheckIcon, text: "text-primary", border: "border-primary", line: "before:bg-primary" },
  further_analysis: { icon: ScanSearchIcon, text: "text-foreground", border: "border-foreground/60", line: "before:bg-foreground/70" },
  not_promising: { icon: XIcon, text: "text-hot", border: "border-hot", line: "before:bg-hot" },
} satisfies Record<ResultLevel, unknown>

/**
 * The overall result (QCT-KF-01, KF-05) with the state mapping of DESIGN-TOKENS §2, whether a
 * fixed rule forced it (industry, unknown source), and the reasons TBL-11 gives for it.
 */
export function VerdictPanel({ result }: { result: QuickCheckComplete }) {
  const lang = useLocale()
  const copy = useDictionary("quick-check")
  const ui = copy.ui.results
  const { assessment, flags } = result
  const level = LEVEL[assessment.level]
  const Icon = level.icon

  return (
    <section
      aria-labelledby="verdict-title"
      data-slot="verdict-panel"
      data-level={assessment.level}
      className={cn(
        "relative grid gap-x-10 gap-y-8 border bg-card p-[clamp(22px,3vw,40px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]",
        "before:absolute before:inset-x-0 before:-top-px before:h-[3px]",
        level.line,
      )}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">{ui.overall}</p>
          <CalcInfo source={explainResult("level", flags)} label={ui.overall} className="-m-2.5" />
        </div>
        <div className="flex items-start gap-4">
          <span className={cn("inline-flex size-14 shrink-0 items-center justify-center border", level.border, level.text)}>
            <Icon className="size-7" strokeWidth={1.6} aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <h2
              id="verdict-title"
              className={cn("text-[clamp(28px,3.4vw,40px)] leading-[1.02] font-[580] tracking-[-0.045em] text-balance [font-stretch:80%]", level.text)}
            >
              {copy.results.levels[assessment.level].label}
            </h2>
            <p className="text-base leading-relaxed text-text-secondary">{copy.results.levels[assessment.level].description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {assessment.forced && (
            <span className="inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-xs tracking-[0.06em] text-foreground uppercase">
              <LockIcon className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
              {ui.forced}
            </span>
          )}
          <CustomParametersBadge />
          <IllustrativeBadge />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">{ui.reasons}</h3>
        <ol className="flex flex-col divide-y border-y" data-slot="reasons">
          {assessment.reasons.map((reason, index) => (
            <li key={reason.code} data-reason={reason.code} className="flex gap-3 py-3 text-[15px] leading-relaxed">
              <span className="pt-0.5 font-mono text-xs text-muted-foreground tabular-nums">{String(index + 1).padStart(2, "0")}</span>
              <span>{reasonText(reason, copy, lang)}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

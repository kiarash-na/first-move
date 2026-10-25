"use client"

import { LockIcon } from "lucide-react"
import { useId } from "react"

import { displayScore } from "@/lib/business-plan"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { AiScore } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { AiBadge } from "./ai-badge"
import { clampPoints, ROUNDING_STEP } from "./display"
import { QuickCheckSignal } from "./quick-check-signal"
import { ScoreMeta } from "./score-meta"
import { ScoreScale } from "./score-scale"

/** Id of the checks section, the target of the "must-have check failed" note. */
export const CHECKS_SECTION_ID = "ai-score-checks"

/**
 * The score first, boldest (PLAN-AI-SCORE-00 step 6): the AI Plan Score rounded to 5 with its band
 * of one standard deviation (`displayScore`), the label and what it means, the 0..100 scale with
 * the zones, the must-have note when a cap keeps it below Solid, the Quick Check signal and the
 * facts of the run. Marked AI-generated.
 */
export function ScoreSummary({ score }: { score: AiScore }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const summary = copy.results.summary
  const titleId = useId()
  const shown = displayScore(score.score, score.sd)
  const level = copy.labels.scoreLevels[score.level]
  const value = formatNumber(shown.score, lang)
  const band = formatNumber(shown.band, lang)

  return (
    <section
      aria-labelledby={titleId}
      data-slot="score-summary"
      data-level={score.level}
      className="relative grid gap-x-10 gap-y-6 border bg-card p-[clamp(20px,3vw,36px)] before:absolute before:inset-x-0 before:-top-px before:h-[3px] before:bg-hot lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]"
    >
      <div data-ai-generated="true" className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id={titleId} className="font-mono text-xs tracking-[0.075em] text-hot uppercase">
            {summary.title}
          </h3>
          <AiBadge />
        </div>
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <p className="flex items-baseline gap-2.5">
            <span className="sr-only">{interpolate(summary.scoreLabel, { score: value, band })}</span>
            <span aria-hidden="true" data-score={shown.score} className="text-[clamp(64px,9vw,104px)] leading-[0.88] font-[580] tracking-[-0.055em] [font-stretch:78%]">
              {value}
            </span>
            <span aria-hidden="true" data-band={shown.band} className="font-mono text-xl text-text-secondary tabular-nums">
              {interpolate(summary.band, { band })}
            </span>
            <span aria-hidden="true" className="text-sm text-muted-foreground">
              {summary.outOf}
            </span>
          </p>
          <div className="flex max-w-[46ch] min-w-0 flex-1 basis-56 flex-col gap-1.5">
            <p data-label={score.level} className="text-[clamp(26px,3vw,36px)] leading-none font-[560] tracking-[-0.04em] [font-stretch:84%]">
              {level.name}
            </p>
            <p className="text-sm leading-relaxed text-text-secondary">{level.description}</p>
          </div>
        </div>
        <ScoreScale score={score.score} sd={score.sd} level={score.level} />
        <p className="text-xs leading-relaxed text-muted-foreground">
          {interpolate(summary.range, {
            from: formatNumber(clampPoints(shown.score - shown.band), lang),
            to: formatNumber(clampPoints(shown.score + shown.band), lang),
          })}
          {" · "}
          {interpolate(summary.rounded, { step: formatNumber(ROUNDING_STEP, lang), raw: formatNumber(score.score, lang, { maximumFractionDigits: 1 }) })}
        </p>
        {score.capped && (
          <p data-slot="capped-note" className="flex items-start gap-2.5 border border-l-2 border-l-hot px-4 py-3 text-sm leading-snug">
            <LockIcon className="mt-0.5 size-4 shrink-0 text-hot" strokeWidth={1.6} aria-hidden="true" />
            <span>
              {interpolate(summary.capped, { solid: copy.labels.scoreLevels.solid.name })}{" "}
              <a href={`#${CHECKS_SECTION_ID}`} className="text-hot underline underline-offset-4">
                {summary.seeChecks}
              </a>
            </span>
          </p>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <QuickCheckSignal signal={score.quickCheck} />
        <ScoreMeta score={score} />
      </div>
    </section>
  )
}

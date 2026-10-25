"use client"

import { aiScoreStatus, displayScore } from "@/lib/business-plan"
import { formatDate, formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Project } from "@/lib/project"
import { useDictionary, useLocale } from "../../_components/i18n-provider"

/**
 * The AI Plan Score as one line on paper (D-73, D-74), above the pitch completeness: the saved
 * score rounded to 5 with its band and label, marked AI-generated, and whether it is still
 * current. A project without a score prints nothing here.
 */
export function ReportAiScore({ project }: { project: Project }) {
  const lang = useLocale()
  const copy = useDictionary("business-plan").aiScore
  const { state, score, changed } = aiScoreStatus(project)
  if (!score) return null
  const shown = displayScore(score.score, score.sd)
  const when =
    state === "outdated"
      ? interpolate(copy.state.outdated, { count: formatNumber(changed.length, lang), total: formatNumber(score.judgements.length, lang) })
      : interpolate(copy.state.current, { date: formatDate(score.at, lang) })

  return (
    <div data-slot="report-ai-score" data-state={state} data-ai-generated="true" className="flex flex-col gap-1.5 border-l-2 border-hot pl-4 break-inside-avoid">
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-xs tracking-[0.06em] text-hot uppercase">{copy.title}</span>
        <span className="font-mono text-2xl leading-none font-semibold tabular-nums">{formatNumber(shown.score, lang)}</span>
        <span className="font-mono text-sm tabular-nums" aria-hidden="true">
          ± {formatNumber(shown.band, lang)}
        </span>
        <span className="sr-only">{interpolate(copy.band, { band: formatNumber(shown.band, lang) })}</span>
        <span className="font-mono text-xs uppercase">{copy.outOf}</span>
        <span className="text-sm font-[560]">{copy.levels[score.level]}</span>
      </p>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {copy.aiGenerated} · {when} · {copy.caveat}
      </p>
    </div>
  )
}

"use client"

import { ArrowRightIcon, SparklesIcon, TriangleAlertIcon } from "lucide-react"
import Link from "next/link"

import { aiScoreStatus, displayScore } from "@/lib/business-plan"
import { dashboardHref } from "@/lib/dashboard/routes"
import { formatDate, formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Project } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"

/**
 * The AI Plan Score on the overview (D-74): a full-width orange strip above the Business Plan
 * tiles, bolder than the completeness tile next to it. Shows the saved score (D-73) rounded to 5
 * with its band and label, marked AI-generated, and whether it is still current; without a score
 * it invites a run. Reads the project only; never the AI layer.
 */
export function AiScoreTile({ project }: { project: Project }) {
  const lang = useLocale()
  const copy = useDictionary("business-plan").aiScore
  const { state, score, changed } = aiScoreStatus(project)
  const shown = score ? displayScore(score.score, score.sd) : null

  return (
    <article
      data-slot="bp-tile"
      data-tile="aiScore"
      data-state={state}
      data-ai-generated={score ? "true" : undefined}
      aria-labelledby="bp-aiScore"
      className="flex flex-col gap-4 border-2 border-hot bg-hot p-5 text-hot-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-6 md:col-span-2 xl:col-span-4"
    >
      <div className="flex flex-col gap-3">
        <h3 id="bp-aiScore" className="inline-flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs font-semibold tracking-[0.075em] uppercase">
          <span className="inline-flex items-center gap-2">
            <SparklesIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
            {copy.title}
          </span>
          {score ? <span className="border border-current px-1.5 py-px font-normal tracking-[0.06em]">{copy.aiGenerated}</span> : null}
        </h3>
        {score && shown ? (
          <>
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-[clamp(40px,4vw,56px)] leading-none font-semibold tabular-nums">{formatNumber(shown.score, lang)}</span>
              <span className="font-mono text-sm tabular-nums" aria-hidden="true">
                ± {formatNumber(shown.band, lang)}
              </span>
              <span className="sr-only">{interpolate(copy.band, { band: formatNumber(shown.band, lang) })}</span>
              <span className="font-mono text-xs tracking-[0.04em] uppercase">{copy.outOf}</span>
              <span className="text-xl leading-none font-[620] tracking-[-0.02em]">{copy.levels[score.level]}</span>
            </p>
            <p className="flex items-start gap-2 font-mono text-xs leading-snug tracking-[0.04em]">
              {state === "outdated" ? (
                <>
                  <TriangleAlertIcon className="size-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                  {interpolate(copy.state.outdated, { count: formatNumber(changed.length, lang), total: formatNumber(score.judgements.length, lang) })}
                </>
              ) : (
                interpolate(copy.state.current, { date: formatDate(score.at, lang) })
              )}
            </p>
          </>
        ) : (
          <p className="max-w-[58ch] text-sm leading-relaxed">{copy.lead}</p>
        )}
        <p className="max-w-[68ch] text-sm leading-snug">{copy.caveat}</p>
      </div>
      <Link
        href={dashboardHref(lang, { page: "ai-score" })}
        className="group inline-flex min-h-11 shrink-0 items-center gap-2 self-start border border-current px-4 font-mono text-xs font-semibold tracking-[0.06em] uppercase transition-transform duration-[180ms] ease-out hover:-translate-y-0.5 active:translate-y-0 sm:self-center motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        {score ? copy.title : copy.cta}
        <ArrowRightIcon className="size-4 transition-transform duration-[180ms] group-hover:translate-x-0.5" strokeWidth={1.6} aria-hidden="true" />
      </Link>
    </article>
  )
}

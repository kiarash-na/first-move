"use client"

import { ArrowRightIcon, SparklesIcon, TriangleAlertIcon } from "lucide-react"
import Link from "next/link"

import { aiScoreStatus, displayScore } from "@/lib/business-plan"
import { dashboardHref } from "@/lib/dashboard/routes"
import { formatDate, formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../_components/i18n-provider"
import { useStoreState } from "../../_components/store-provider"

/**
 * The AI Plan Score at a glance (D-74): placed before the completeness meter and bolder than it,
 * on a filled orange surface (DESIGN-TOKENS §1: orange = Business Plan) with a larger number. It
 * shows the saved result (D-73) rounded to 5 with its band, the label, "AI-generated" (AI Act
 * Art. 50(2), also as `data-ai-generated`) and whether it is current; without a score it invites
 * a run. Core code: it reads `project.aiScore` and never imports the AI layer.
 */
export function AiScoreBadge({ layout = "compact" }: { layout?: "compact" | "wide" }) {
  const lang = useLocale()
  const copy = useDictionary("business-plan").aiScore
  const project = useStoreState((state) => state.active)
  if (!project) return null
  const { state, score, changed } = aiScoreStatus(project)
  const wide = layout === "wide"
  const shown = score ? displayScore(score.score, score.sd) : null

  return (
    <Link
      href={dashboardHref(lang, { page: "ai-score" })}
      data-slot="ai-score-badge"
      data-state={state}
      data-ai-generated={score ? "true" : undefined}
      className={cn(
        "group flex min-h-11 w-full flex-col gap-3 border-2 border-hot bg-hot px-5 py-4 text-hot-foreground transition-transform duration-[180ms] ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        wide ? "sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-6 sm:py-5" : "sm:w-80",
      )}
    >
      <span className={cn("flex flex-col gap-3", wide && "sm:flex-1")}>
        <span className="flex items-center justify-between gap-3 font-mono text-xs tracking-[0.075em] uppercase">
          <span className="inline-flex items-center gap-2 font-semibold">
            <SparklesIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
            {copy.title}
          </span>
          {score ? <span className="border border-current px-1.5 py-px tracking-[0.06em]">{copy.aiGenerated}</span> : null}
        </span>

        {score && shown ? (
          <>
            <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className={cn("font-mono leading-none font-semibold tabular-nums", wide ? "text-6xl" : "text-5xl")}>
                {formatNumber(shown.score, lang)}
              </span>
              <span className="font-mono text-sm tabular-nums" aria-hidden="true">
                ± {formatNumber(shown.band, lang)}
              </span>
              <span className="sr-only">{interpolate(copy.band, { band: formatNumber(shown.band, lang) })}</span>
              <span className="font-mono text-xs tracking-[0.04em] uppercase">{copy.outOf}</span>
              <span className="text-lg leading-none font-[620] tracking-[-0.02em]">{copy.levels[score.level]}</span>
            </span>
            <span className="flex items-start gap-2 font-mono text-xs leading-snug tracking-[0.04em]">
              {state === "outdated" ? (
                <>
                  <TriangleAlertIcon className="size-3.5 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                  {interpolate(copy.state.outdated, {
                    count: formatNumber(changed.length, lang),
                    total: formatNumber(score.judgements.length, lang),
                  })}
                </>
              ) : (
                interpolate(copy.state.current, { date: formatDate(score.at, lang) })
              )}
            </span>
          </>
        ) : (
          <>
            <span className="text-xl leading-tight font-[620] tracking-[-0.02em]">{copy.cta}</span>
            <span className="text-sm leading-snug">{copy.lead}</span>
          </>
        )}
      </span>
      <ArrowRightIcon
        className={cn("size-5 shrink-0 self-end transition-transform duration-[180ms] group-hover:translate-x-0.5", wide && "sm:self-center")}
        strokeWidth={1.8}
        aria-hidden="true"
      />
    </Link>
  )
}

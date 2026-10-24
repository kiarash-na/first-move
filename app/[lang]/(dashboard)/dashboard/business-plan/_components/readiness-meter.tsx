"use client"

import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"

import { Progress } from "@/components/ui/progress"
import { pitchReadiness } from "@/lib/business-plan"
import { dashboardHref } from "@/lib/dashboard/routes"
import { formatNumber, formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary, useLocale } from "../../_components/i18n-provider"
import { useStoreState } from "../../_components/store-provider"

/** The pitch readiness at a glance, in the header of every step; links to the full panel. */
export function ReadinessMeter() {
  const lang = useLocale()
  const bp = useDictionary("business-plan")
  const project = useStoreState((state) => state.active)
  if (!project) return null
  const readiness = pitchReadiness(project)
  const met = readiness.sections.reduce((sum, section) => sum + section.met, 0)
  const total = readiness.sections.reduce((sum, section) => sum + section.total, 0)

  return (
    <Link
      href={`${dashboardHref(lang, { page: "business-plan", step: "implementation" })}#readiness`}
      className="group flex min-h-11 w-full flex-col gap-3 border bg-card px-5 py-4 transition-colors duration-[180ms] hover:border-hot sm:w-72"
      data-slot="readiness-meter"
    >
      <span className="flex items-center justify-between gap-3 font-mono text-xs tracking-[0.075em] text-hot uppercase">
        {bp.readiness.title}
        <ArrowRightIcon
          className="size-4 transition-transform duration-[180ms] group-hover:translate-x-0.5"
          strokeWidth={1.6}
          aria-hidden="true"
        />
      </span>
      <span className="flex items-baseline gap-3">
        <span className="font-mono text-3xl leading-none tabular-nums">
          {formatPercent(readiness.score, lang)}
        </span>
        <span className="text-sm text-text-secondary">{bp.readiness.level[readiness.level]}</span>
      </span>
      <Progress tone="hot" value={Math.round(readiness.score * 100)} aria-label={bp.readiness.title} />
      <span className="font-mono text-xs tracking-[0.04em] text-muted-foreground">
        {interpolate(bp.readiness.summary, { met: formatNumber(met, lang), total: formatNumber(total, lang) })}
      </span>
    </Link>
  )
}

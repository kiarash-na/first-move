"use client"

import { ArrowRightIcon, PresentationIcon } from "lucide-react"
import Link from "next/link"

import { Progress } from "@/components/ui/progress"
import { pitchReadiness } from "@/lib/business-plan"
import { dashboardHref } from "@/lib/dashboard/routes"
import { formatNumber, formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Project } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { BpTile } from "./bp-tile"

/** Pitch completeness (D-30, D-74; ids keep "readiness"): the score, its level and how many points are covered. Counts what is filled in, not quality. */
export function ReadinessTile({ project }: { project: Project }) {
  const lang = useLocale()
  const copy = useDictionary("overview").bp.readiness
  const readiness = useDictionary("business-plan").readiness
  const result = pitchReadiness(project)
  const met = result.sections.reduce((sum, section) => sum + section.met, 0)
  const total = result.sections.reduce((sum, section) => sum + section.total, 0)

  return (
    <BpTile id="readiness" icon={PresentationIcon} title={copy.title}>
      <p className="flex items-baseline gap-2">
        <span className="text-[clamp(32px,3vw,44px)] leading-none font-[560] tracking-[-0.045em] [font-stretch:84%]">{formatPercent(result.score, lang)}</span>
        <span className="font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">{readiness.level[result.level]}</span>
      </p>
      <Progress tone="hot" value={Math.round(result.score * 100)} aria-label={copy.title} />
      <p className="text-sm leading-relaxed text-text-secondary">{interpolate(readiness.summary, { met: formatNumber(met, lang), total: formatNumber(total, lang) })}</p>
      <p className="text-sm leading-snug text-muted-foreground">{copy.caveat}</p>
      <Link
        href={`${dashboardHref(lang, { page: "business-plan", step: "implementation" })}#readiness`}
        className="group mt-auto inline-flex min-h-11 items-center gap-2 font-mono text-xs tracking-[0.06em] text-hot uppercase"
      >
        {readiness.open}
        <ArrowRightIcon className="size-4 transition-transform duration-[180ms] group-hover:translate-x-0.5" strokeWidth={1.6} aria-hidden="true" />
      </Link>
    </BpTile>
  )
}

"use client"

import { ListChecksIcon } from "lucide-react"
import Link from "next/link"

import { Progress } from "@/components/ui/progress"
import { allProgress, overallProgress } from "@/lib/business-plan"
import { dashboardHref } from "@/lib/dashboard/routes"
import { formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Project } from "@/lib/project"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { BpTile } from "./bp-tile"

/** Progress of the four Business Plan steps (BM-SCOPE-11, D-28), each linking to its step. */
export function StepProgressTile({ project }: { project: Project }) {
  const lang = useLocale()
  const copy = useDictionary("overview").bp.steps
  const names = useDictionary("shell").nav.items.businessPlan
  const progress = allProgress(project)
  const overall = overallProgress(progress)

  return (
    <BpTile id="steps" icon={ListChecksIcon} title={copy.title}>
      <p className="flex items-baseline gap-2">
        <span className="text-[clamp(32px,3vw,44px)] leading-none font-[560] tracking-[-0.045em] [font-stretch:84%]">{formatPercent(overall, lang)}</span>
        <span className="font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">{copy.overall}</span>
      </p>
      <ul className="flex flex-col divide-y border-y">
        {progress.map((entry) => (
          <li key={entry.step}>
            <Link
              href={dashboardHref(lang, { page: "business-plan", step: entry.step })}
              className="group flex min-h-11 flex-col justify-center gap-1.5 py-2 transition-colors duration-[180ms] hover:text-hot"
            >
              <span className="flex items-baseline justify-between gap-3 text-sm">
                {names[entry.step]}
                <span className="font-mono text-xs text-muted-foreground tabular-nums" title={interpolate(copy.progress, { done: entry.done, total: entry.total })}>
                  {entry.done}/{entry.total}
                </span>
              </span>
              <Progress tone="hot" value={Math.round(entry.fraction * 100)} aria-label={`${names[entry.step]}: ${interpolate(copy.progress, { done: entry.done, total: entry.total })}`} />
            </Link>
          </li>
        ))}
      </ul>
    </BpTile>
  )
}

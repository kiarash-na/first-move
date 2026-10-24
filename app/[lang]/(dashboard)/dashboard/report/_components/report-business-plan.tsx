"use client"

import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { lookup } from "@/lib/i18n/lookup"
import type { Project } from "@/lib/project"
import { businessPlanEntries } from "@/lib/report/business-plan-entries"
import { useDictionary, useLocale } from "../../_components/i18n-provider"
import { ReportAnswer } from "./report-answer"

/** The four Business Plan steps with what has been written in each (`businessPlanEntries`). */
export function ReportBusinessPlan({ project }: { project: Project }) {
  const lang = useLocale()
  const businessPlan = useDictionary("business-plan")
  const copy = useDictionary("report").businessPlan
  const steps = useDictionary("shell").nav.items.businessPlan

  return (
    <div data-slot="report-business-plan" className="flex flex-col gap-10">
      {businessPlanEntries(project).map(({ step, progress, entries }) => (
        <div key={step} className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 break-after-avoid">
            <h3 className="text-lg leading-snug font-[560] tracking-[-0.025em]">{steps[step]}</h3>
            <span className="font-mono text-xs tracking-[0.04em] text-muted-foreground tabular-nums">
              {interpolate(copy.progress, { done: formatNumber(progress.done, lang), total: formatNumber(progress.total, lang) })}
            </span>
          </div>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">{copy.empty}</p>
          ) : (
            <dl className="flex flex-col divide-y border-y">
              {entries.map((entry) => (
                <div key={entry.id} className="grid gap-2 py-3 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-6 print:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
                  <dt className="text-sm leading-snug font-[480] text-text-secondary">{lookup(businessPlan, entry.label.key)}</dt>
                  <dd className="min-w-0">
                    <ReportAnswer answer={entry.answer} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      ))}
    </div>
  )
}

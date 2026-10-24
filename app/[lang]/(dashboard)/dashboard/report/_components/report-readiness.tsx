"use client"

import { CheckIcon, CircleDashedIcon } from "lucide-react"

import { pitchReadiness, type CheckId } from "@/lib/business-plan"
import { formatNumber, formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Project } from "@/lib/project"
import { useDictionary, useLocale } from "../../_components/i18n-provider"

/**
 * Pitch readiness for paper (D-30, D-37): the score, then each of the six pitch sections with
 * its checks, covered or open (icon and words, never colour alone). Unofficial, and it counts
 * filled fields only.
 */
export function ReportReadiness({ project }: { project: Project }) {
  const lang = useLocale()
  const readinessCopy = useDictionary("business-plan").readiness
  const copy = useDictionary("report").readiness
  const readiness = pitchReadiness(project)
  const met = readiness.sections.reduce((sum, section) => sum + section.met, 0)
  const total = readiness.sections.reduce((sum, section) => sum + section.total, 0)

  return (
    <div data-slot="report-readiness" className="flex flex-col gap-5">
      <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-mono text-3xl leading-none tabular-nums">{formatPercent(readiness.score, lang)}</span>
        <span className="text-sm text-text-secondary">
          {readinessCopy.level[readiness.level]} · {interpolate(copy.summary, { met: formatNumber(met, lang), total: formatNumber(total, lang) })}
        </span>
      </p>
      <p className="max-w-[68ch] text-xs leading-relaxed text-muted-foreground">{readinessCopy.caveat}</p>
      <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2">
        {readiness.sections.map((section) => (
          <div key={section.id} className="flex flex-col gap-2 border p-4 break-inside-avoid">
            <h3 className="flex items-baseline justify-between gap-3 text-sm leading-snug font-[540]">
              {readinessCopy.sections[section.id].label}
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {formatNumber(section.met, lang)}/{formatNumber(section.total, lang)}
              </span>
            </h3>
            <ul className="flex flex-col gap-1.5">
              {section.checks.map((check) => (
                <li key={check.id} className="flex items-start gap-2 text-xs leading-snug">
                  {check.met ? (
                    <CheckIcon className="mt-px size-3.5 shrink-0 text-hot" strokeWidth={1.8} aria-hidden="true" />
                  ) : (
                    <CircleDashedIcon className="mt-px size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.6} aria-hidden="true" />
                  )}
                  <span>
                    <span className="sr-only">{check.met ? readinessCopy.met : readinessCopy.missing}: </span>
                    {readinessCopy.checks[check.id as CheckId]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

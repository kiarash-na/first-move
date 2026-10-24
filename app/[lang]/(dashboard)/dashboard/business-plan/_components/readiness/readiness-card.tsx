"use client"

import { ArrowUpRightIcon, CheckIcon, CircleDashedIcon } from "lucide-react"
import Link from "next/link"
import { useId, type ReactNode } from "react"

import { Progress } from "@/components/ui/progress"
import type { CheckId, ReadinessGroup } from "@/lib/business-plan"
import { dashboardHref } from "@/lib/dashboard/routes"
import { formatNumber, formatPercent } from "@/lib/i18n/format"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"

/**
 * One pitch section or jury criterion: its score, and each check with covered or open (icon and
 * text, never colour alone) and a link to the step where an open check is filled in.
 */
export function ReadinessCard({
  label,
  question,
  group,
  badge,
}: {
  label: string
  question?: string
  group: ReadinessGroup<string>
  badge?: ReactNode
}) {
  const lang = useLocale()
  const bp = useDictionary("business-plan")
  const titleId = useId()
  const complete = group.met === group.total

  return (
    <article aria-labelledby={titleId} className="flex flex-col gap-4 border bg-background p-5">
      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h4 id={titleId} className="text-lg leading-snug font-[540] tracking-[-0.02em] text-balance">
            {label}
          </h4>
          {badge}
        </div>
        {question && <p className="text-sm leading-snug text-muted-foreground">{question}</p>}
        <div className="flex items-center gap-3">
          <Progress tone="hot" value={Math.round(group.score * 100)} aria-label={label} className="flex-1" />
          <span className="font-mono text-xs tracking-[0.04em] tabular-nums">
            {formatNumber(group.met, lang)}/{formatNumber(group.total, lang)} · {formatPercent(group.score, lang)}
          </span>
        </div>
      </header>
      <ul className="flex flex-col divide-y border-t">
        {group.checks.map((check) => {
          const text = bp.readiness.checks[check.id as CheckId]
          return (
            <li key={check.id} className="flex items-start gap-3 py-2.5">
              {check.met ? (
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-hot" strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <CircleDashedIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.6} aria-hidden="true" />
              )}
              <span className="flex-1 text-sm leading-snug">
                <span className="sr-only">{check.met ? bp.readiness.met : bp.readiness.missing}: </span>
                {text}
              </span>
              {!check.met && (
                <Link
                  href={dashboardHref(lang, { page: "business-plan", step: check.step })}
                  aria-label={`${bp.readiness.fill}: ${text}`}
                  className="inline-flex min-h-11 shrink-0 items-center gap-1 font-mono text-xs tracking-[0.06em] text-hot uppercase hover:underline"
                >
                  {bp.readiness.fill}
                  <ArrowUpRightIcon className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
                </Link>
              )}
            </li>
          )
        })}
      </ul>
      {complete && (
        <p className="flex items-center gap-2 font-mono text-xs tracking-[0.06em] text-hot uppercase">
          <CheckIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
          {bp.readiness.level.ready}
        </p>
      )}
    </article>
  )
}

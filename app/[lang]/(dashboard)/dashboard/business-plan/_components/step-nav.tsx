"use client"

import { CheckIcon } from "lucide-react"
import Link from "next/link"

import { Progress } from "@/components/ui/progress"
import { allProgress } from "@/lib/business-plan"
import { BUSINESS_PLAN_PAGES, dashboardHref } from "@/lib/dashboard/routes"
import { formatNumber, formatPercent } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { BusinessPlanStep } from "@/lib/project"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../_components/i18n-provider"
import { useStoreState } from "../../_components/store-provider"

/**
 * The four Business Plan steps with progress per step (BM-SCOPE-11, D-28). Navigation is free:
 * every step links to every other, in any order.
 */
export function StepNav({ current }: { current: BusinessPlanStep }) {
  const lang = useLocale()
  const shell = useDictionary("shell")
  const bp = useDictionary("business-plan")
  const project = useStoreState((state) => state.active)
  const progress = project ? allProgress(project) : []

  return (
    <nav aria-label={bp.stepNav.label} className="flex flex-col gap-3">
      <ol className="grid grid-cols-2 gap-px border bg-border lg:grid-cols-4">
        {BUSINESS_PLAN_PAGES.map((step, index) => {
          const entry = progress.find((item) => item.step === step)
          const done = entry !== undefined && entry.total > 0 && entry.done === entry.total
          const isCurrent = step === current
          return (
            <li key={step} className="bg-background">
              <Link
                href={dashboardHref(lang, { page: "business-plan", step })}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "group relative flex h-full min-h-[88px] flex-col justify-between gap-3 p-4 transition-colors duration-[180ms] hover:bg-accent/50 sm:p-5",
                  isCurrent && "bg-card",
                )}
              >
                <span className="flex flex-col gap-1.5">
                  {/* Number and done mark share the top row, so the title has the full cell width and never runs under the mark. */}
                  <span className="flex min-h-4 items-center justify-between gap-2">
                    <span className={cn("font-mono text-xs tracking-[0.075em] tabular-nums", isCurrent || done ? "text-hot" : "text-muted-foreground")}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {done && (
                      <span data-slot="step-done" className="inline-flex items-center gap-1 font-mono text-xs tracking-[0.06em] text-hot uppercase">
                        <CheckIcon className="size-4" strokeWidth={1.8} aria-hidden="true" />
                        <span className="max-sm:sr-only">{bp.stepNav.done}</span>
                      </span>
                    )}
                  </span>
                  <span data-slot="step-title" className="min-w-0 text-[15px] leading-tight min-[360px]:text-base font-[520] tracking-[-0.01em] hyphens-auto [overflow-wrap:anywhere]">
                    {shell.nav.items.businessPlan[step]}
                  </span>
                </span>
                <span className="flex flex-col gap-2">
                  <span className="flex items-baseline justify-between gap-2 font-mono text-xs tracking-[0.04em] text-muted-foreground">
                    <span>
                      {entry ? interpolate(bp.stepNav.progress, { done: formatNumber(entry.done, lang), total: formatNumber(entry.total, lang) }) : ""}
                    </span>
                    <span className="tabular-nums">{entry ? formatPercent(entry.fraction, lang) : ""}</span>
                  </span>
                  <Progress
                    tone="hot"
                    value={entry ? Math.round(entry.fraction * 100) : 0}
                    aria-label={shell.nav.items.businessPlan[step]}
                  />
                </span>
                {isCurrent && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-hot" />}
              </Link>
            </li>
          )
        })}
      </ol>
      <p className="text-sm text-muted-foreground">{bp.stepNav.freeOrder}</p>
    </nav>
  )
}

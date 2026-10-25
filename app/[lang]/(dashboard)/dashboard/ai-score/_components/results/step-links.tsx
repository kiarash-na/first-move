"use client"

import { PencilIcon } from "lucide-react"
import Link from "next/link"

import { dashboardHref } from "@/lib/dashboard/routes"
import { interpolate } from "@/lib/i18n/interpolate"
import type { BusinessPlanStep } from "@/lib/project/fields"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"

/** Links to the Business Plan steps where a plan part is edited ("Edit in Opportunity"). */
export function StepLinks({ steps, template, className }: { steps: readonly BusinessPlanStep[]; template: string; className?: string }) {
  const lang = useLocale()
  const shell = useDictionary("shell")
  if (steps.length === 0) return null
  return (
    <span data-slot="step-links" className={cn("inline-flex flex-wrap gap-x-3", className)}>
      {steps.map((step) => (
        <Link
          key={step}
          href={dashboardHref(lang, { page: "business-plan", step })}
          className="inline-flex min-h-11 items-center gap-1.5 font-mono text-xs tracking-[0.04em] text-muted-foreground underline-offset-4 transition-colors duration-[180ms] hover:text-hot hover:underline"
        >
          <PencilIcon className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
          {interpolate(template, { step: shell.nav.items.businessPlan[step] })}
        </Link>
      ))}
    </span>
  )
}

"use client"

import { ArrowRightIcon, CircleDashedIcon } from "lucide-react"
import Link from "next/link"
import { dashboardHref, type DashboardRoute } from "@/lib/dashboard/routes"
import { QUICK_CHECK_STEPS, type FieldStep, type QuickCheckStep } from "@/lib/project"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "./i18n-provider"

const isInputStep = (step: FieldStep): step is QuickCheckStep => (QUICK_CHECK_STEPS as readonly string[]).includes(step)

/** Links to the Quick Check steps that still miss something (R-03): no result until they are done. */
export function MissingSteps({ steps, className }: { steps: readonly FieldStep[]; className?: string }) {
  const lang = useLocale()
  const nav = useDictionary("shell").nav.items
  const links = steps.flatMap((step): { step: string; label: string; route: DashboardRoute }[] => {
    if (isInputStep(step)) return [{ step, label: nav.quickCheck[step], route: { page: "quick-check", step } }]
    if (step === "assumptions") return [{ step, label: nav.assumptions, route: { page: "assumptions" } }]
    return []
  })
  return (
    <ul className={cn("flex flex-col divide-y border-y", className)}>
      {links.map((link) => (
        <li key={link.step}>
          <Link
            href={dashboardHref(lang, link.route)}
            className="group flex min-h-11 items-center gap-3 py-2 text-sm transition-colors duration-[180ms] hover:text-primary"
          >
            <CircleDashedIcon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.6} aria-hidden="true" />
            <span className="flex-1">{link.label}</span>
            <ArrowRightIcon
              className="size-4 text-muted-foreground transition-transform duration-[180ms] group-hover:translate-x-0.5 group-hover:text-primary"
              strokeWidth={1.6}
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}

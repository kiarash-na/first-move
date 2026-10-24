"use client"

import { CheckIcon, CircleDashedIcon } from "lucide-react"
import Link from "next/link"
import { dashboardHref, QUICK_CHECK_PAGES, type QuickCheckPage } from "@/lib/dashboard/routes"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../_components/i18n-provider"
import { useQuickCheck } from "../../_components/use-quick-check"

/**
 * The structured input process (QCT-IN-00): the four steps and the results, each with its state
 * (missing input or complete) once the project is loaded. Free navigation between steps.
 */
export function Stepper({ current }: { current: QuickCheckPage }) {
  const lang = useLocale()
  const shell = useDictionary("shell")
  const copy = useDictionary("quick-check").ui.stepper
  const { result } = useQuickCheck()
  const missing = new Set<string>(result?.status === "incomplete" ? result.incompleteSteps : [])

  return (
    <nav aria-label={copy.label} data-slot="stepper">
      <ol className="flex gap-px border bg-border">
        {QUICK_CHECK_PAGES.map((page, index) => {
          const active = page === current
          const isStep = page !== "results"
          const state = !result || !isStep ? null : missing.has(page) ? "missing" : "done"
          return (
            <li key={page} className={cn("flex min-w-11 flex-1 bg-background", active && "max-sm:flex-[4]")}>
              <Link
                href={dashboardHref(lang, { page: "quick-check", step: page })}
                aria-current={active ? "step" : undefined}
                data-state={state ?? undefined}
                className={cn(
                  "group relative flex min-h-14 w-full min-w-0 flex-col justify-center gap-1 px-2.5 py-2 transition-colors duration-[180ms] sm:px-4",
                  "before:absolute before:inset-x-0 before:-top-px before:h-0.5",
                  active ? "bg-card before:bg-primary" : "hover:bg-accent/50",
                )}
              >
                <span className="flex items-center gap-1.5 font-mono text-xs tracking-[0.06em] text-muted-foreground tabular-nums">
                  <span className={cn(active && "text-primary")}>{isStep ? String(index + 1).padStart(2, "0") : "→"}</span>
                  {state === "done" && (
                    <>
                      <CheckIcon className="size-3.5 text-primary" strokeWidth={1.8} aria-hidden="true" />
                      <span className="sr-only">{copy.done}</span>
                    </>
                  )}
                  {state === "missing" && (
                    <>
                      <CircleDashedIcon className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
                      <span className="sr-only">{copy.missing}</span>
                    </>
                  )}
                </span>
                <span
                  className={cn(
                    "truncate text-sm leading-tight",
                    active ? "text-foreground" : "text-text-secondary group-hover:text-foreground",
                    !active && "max-sm:sr-only",
                  )}
                >
                  {shell.nav.items.quickCheck[page]}
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

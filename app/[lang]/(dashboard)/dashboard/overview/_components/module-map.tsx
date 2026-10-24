"use client"

import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"

import { navSections } from "@/lib/dashboard/nav"
import { dashboardHref } from "@/lib/dashboard/routes"
import { lookup } from "@/lib/i18n/lookup"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../../_components/i18n-provider"
import { useStoreState } from "../../_components/store-provider"

/** Until phase 09 builds the overview: a map of the open project's module steps, one link each. */
export function ModuleMap() {
  const lang = useLocale()
  const shell = useDictionary("shell")
  const modules = useStoreState((state) => state.active?.meta.modules ?? null)
  if (!modules) return null
  const sections = navSections(modules).filter((section) => section.id !== "project")

  return (
    <div className={cn("grid gap-px border bg-border", sections.length > 1 && "lg:grid-cols-2")}>
      {sections.map((section) => (
        <section key={section.id} aria-labelledby={`map-${section.id}`} className="flex flex-col bg-background">
          <h2
            id={`map-${section.id}`}
            className={cn(
              "border-b px-6 py-4 font-mono text-xs tracking-[0.075em] uppercase",
              section.tone === "cool" ? "text-primary" : "text-hot",
            )}
          >
            {shell.nav.sections[section.id]}
          </h2>
          <ul className="flex flex-col divide-y">
            {section.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={dashboardHref(lang, item.route)}
                  className="group flex min-h-14 items-center gap-4 px-6 transition-colors duration-[180ms] hover:bg-accent/50"
                >
                  <span className="w-6 font-mono text-xs text-muted-foreground tabular-nums">
                    {item.step !== null ? String(item.step).padStart(2, "0") : ""}
                  </span>
                  <span className="flex-1 text-base">{lookup(shell.nav.items, item.id)}</span>
                  <ArrowRightIcon
                    className={cn(
                      "size-4 text-muted-foreground transition-transform duration-[180ms] group-hover:translate-x-0.5",
                      section.tone === "cool" ? "group-hover:text-primary" : "group-hover:text-hot",
                    )}
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

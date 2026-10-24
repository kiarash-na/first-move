"use client"

import { ArrowRightIcon, PencilLineIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { dashboardHref } from "@/lib/dashboard/routes"
import { IllustrativeBadge } from "../../_components/illustrative-badge"
import { ModuleBadges } from "../../_components/module-badges"
import { PageHeader } from "../../_components/page-header"
import { useDictionary, useLocale } from "../../_components/i18n-provider"
import { useQuickCheck } from "../../_components/use-quick-check"
import { AddModuleCard } from "./add-module-card"
import { BusinessPlanSection } from "./business-plan/business-plan-section"
import { QuickCheckIncomplete } from "./quick-check-incomplete"
import { QuickCheckSection } from "./quick-check-section"

/**
 * The overview of the open project (D-06): verdict first, then the key numbers, the charts and,
 * when the module is on, the Business Plan tiles. A module that is off shows an "Add" card. All
 * numbers come from `run()` through `useQuickCheck`; nothing is computed here or stored.
 */
export function OverviewView() {
  const lang = useLocale()
  const copy = useDictionary("overview")
  const { project, result } = useQuickCheck()
  if (!project || !result) return null
  const { modules } = project.meta

  return (
    <div data-slot="overview" className="flex flex-col gap-10">
      <PageHeader
        eyebrow={copy.header.eyebrow}
        title={project.meta.name}
        description={
          <span className="flex flex-wrap items-center gap-1.5">
            <ModuleBadges modules={modules} />
            <IllustrativeBadge />
          </span>
        }
        actions={
          modules.quickCheck ? (
            <>
              <Button asChild variant="secondary">
                <Link href={dashboardHref(lang, { page: "quick-check", step: "area" })}>
                  <PencilLineIcon strokeWidth={1.6} aria-hidden="true" />
                  {copy.header.edit}
                </Link>
              </Button>
              <Button asChild>
                <Link href={dashboardHref(lang, { page: "quick-check", step: "results" })}>
                  {copy.header.results}
                  <ArrowRightIcon strokeWidth={1.6} aria-hidden="true" />
                </Link>
              </Button>
            </>
          ) : undefined
        }
      />
      {modules.quickCheck ? (
        result.status === "complete" ? (
          <QuickCheckSection result={result} />
        ) : (
          <QuickCheckIncomplete result={result} />
        )
      ) : (
        <AddModuleCard module="quickCheck" />
      )}
      {modules.businessPlan ? <BusinessPlanSection project={project} /> : <AddModuleCard module="businessPlan" />}
    </div>
  )
}

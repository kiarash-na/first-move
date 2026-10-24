"use client"

import type { Project } from "@/lib/project"
import { useDictionary } from "../../../_components/i18n-provider"
import { DealBreakerTile } from "./deal-breaker-tile"
import { ReadinessTile } from "./readiness-tile"
import { RisksTile } from "./risks-tile"
import { StepProgressTile } from "./step-progress-tile"

/** The Business Plan tiles of the overview (PLAN-DASH-09 step 6): step progress, pitch readiness, top risks, deal-breaker. */
export function BusinessPlanSection({ project }: { project: Project }) {
  const title = useDictionary("overview").sections.businessPlan
  return (
    <section aria-labelledby="overview-bp" data-slot="business-plan-section" className="flex flex-col gap-5">
      <h2 id="overview-bp" className="font-mono text-xs tracking-[0.075em] text-hot uppercase">
        {title}
      </h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StepProgressTile project={project} />
        <ReadinessTile project={project} />
        <RisksTile project={project} />
        <DealBreakerTile project={project} />
      </div>
    </section>
  )
}

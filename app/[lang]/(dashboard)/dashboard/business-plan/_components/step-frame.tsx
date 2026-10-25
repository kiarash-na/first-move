"use client"

import type { ReactNode } from "react"

import type { BusinessPlanStep } from "@/lib/project"
import { BUSINESS_PLAN_PAGES } from "@/lib/dashboard/routes"
import { useDictionary } from "../../_components/i18n-provider"
import { IllustrativeBadge } from "../../_components/illustrative-badge"
import { PageHeader } from "../../_components/page-header"
import { AiScoreBadge } from "./ai-score-badge"
import { GuidingPrompts } from "./guiding-prompts"
import { ReadinessMeter } from "./readiness-meter"
import { StepNav } from "./step-nav"

/**
 * The frame of every Business Plan step: header with the AI Plan Score (bolder, first, D-74) and
 * the pitch completeness, the four steps with progress, the guiding prompts, then the step's
 * panels (orange emphasis, DESIGN-TOKENS §6).
 */
export function StepFrame({ step, children }: { step: BusinessPlanStep; children: ReactNode }) {
  const shell = useDictionary("shell")
  const bp = useDictionary("business-plan")
  const index = BUSINESS_PLAN_PAGES.indexOf(step)

  return (
    <div className="flex flex-col gap-8" data-step={step}>
      <PageHeader
        tone="hot"
        eyebrow={`${shell.nav.sections.businessPlan} · ${String(index + 1).padStart(2, "0")}`}
        title={shell.nav.items.businessPlan[step]}
        description={bp.page[step].lead}
        actions={
          <>
            <IllustrativeBadge />
            <AiScoreBadge />
            <ReadinessMeter />
          </>
        }
      />
      <StepNav current={step} />
      <GuidingPrompts step={step} />
      <div className="flex flex-col gap-10">{children}</div>
    </div>
  )
}

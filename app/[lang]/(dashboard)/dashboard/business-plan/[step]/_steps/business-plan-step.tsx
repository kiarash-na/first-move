"use client"

import type { BusinessPlanStep as StepId } from "@/lib/project"
import { StepFrame } from "../../_components/step-frame"
import { BusinessLogicStep } from "./business-logic/business-logic-step"
import { ImplementationStep } from "./implementation/implementation-step"
import { OpportunityStep } from "./opportunity/opportunity-step"
import { RealityCheckStep } from "./reality-check/reality-check-step"

const STEPS = {
  opportunity: OpportunityStep,
  "business-logic": BusinessLogicStep,
  "reality-check": RealityCheckStep,
  implementation: ImplementationStep,
} satisfies Record<StepId, () => React.JSX.Element>

/** One Business Plan step (BM-STEP-01..04) inside the shared frame; the page passes the route's step. */
export function BusinessPlanStep({ step }: { step: StepId }) {
  const Step = STEPS[step]
  return (
    <StepFrame step={step}>
      <Step />
    </StepFrame>
  )
}

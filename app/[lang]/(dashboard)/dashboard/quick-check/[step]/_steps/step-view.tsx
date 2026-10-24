"use client"

import type { ReactNode } from "react"
import type { QuickCheckStep } from "@/lib/project"
import { StepLayout } from "../../_components/step-layout"
import { AreaStep } from "./area/area-step"
import { BuildingsStep } from "./buildings/buildings-step"
import { OptionsStep } from "./options/options-step"
import { SourcesStep } from "./sources/sources-step"

const STEPS: Record<QuickCheckStep, () => ReactNode> = {
  area: AreaStep,
  buildings: BuildingsStep,
  sources: SourcesStep,
  options: OptionsStep,
}

/** One Quick Check input step inside the shared step frame (stepper, rail, How we calculate). */
export function StepView({ step }: { step: QuickCheckStep }) {
  const Step = STEPS[step]
  return (
    <StepLayout step={step}>
      <Step />
    </StepLayout>
  )
}

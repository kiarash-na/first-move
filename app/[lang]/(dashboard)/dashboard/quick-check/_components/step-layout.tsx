"use client"

import type { ReactNode } from "react"
import type { QuickCheckStep } from "@/lib/project"
import { STEP_EXPLAIN } from "@/lib/quick-check"
import { HowWeCalculate } from "../../_components/how-we-calculate"
import { MobileRail } from "./result-rail/mobile-rail"
import { ResultRail } from "./result-rail/result-rail"
import { StepFooter } from "./step-footer"
import { Stepper } from "./stepper"

/**
 * The frame of a Quick Check input step: stepper, the step's inputs, its "How we calculate"
 * (D-33), back/next, and the live result rail beside it (collapsed into a bar up to 1100px).
 * The step body is a size container, so grids adapt to the space the rail leaves.
 */
export function StepLayout({ step, children }: { step: QuickCheckStep; children: ReactNode }) {
  return (
    <div data-slot="step-layout" data-step={step} className="flex flex-col gap-8">
      <Stepper current={step} />
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[minmax(0,1fr)_21.5rem] xl:gap-10">
        <div className="flex min-w-0 flex-col gap-8">
          <MobileRail className="lg:hidden" />
          <div className="@container flex flex-col gap-8">{children}</div>
          <HowWeCalculate source={STEP_EXPLAIN[step]} className="border-t pt-3" />
          <StepFooter step={step} />
        </div>
        <ResultRail className="sticky top-24 max-lg:hidden" />
      </div>
    </div>
  )
}

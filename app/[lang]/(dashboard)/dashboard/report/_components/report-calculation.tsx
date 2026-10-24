"use client"

import { QUICK_CHECK_STEPS } from "@/lib/project/fields/steps"
import { STEP_EXPLAIN } from "@/lib/quick-check"
import { useDictionary } from "../../_components/i18n-provider"
import { LazyCalcExplanation } from "../../_components/how-we-calculate/lazy-calc-explanation"

const STEPS = [...QUICK_CHECK_STEPS, "assumptions"] as const

/**
 * "How we calculate" written out for paper (D-33): the explanation of every input step and of the
 * assumptions, with the formulas, open instead of collapsed. The MathML loads with the report.
 */
export function ReportCalculation() {
  const nav = useDictionary("shell").nav.items

  return (
    <div data-slot="report-calculation" className="flex flex-col gap-8">
      {STEPS.map((step) => (
        <div key={step} className="flex flex-col gap-3">
          <h3 className="font-mono text-xs tracking-[0.075em] text-primary uppercase break-after-avoid">
            {step === "assumptions" ? nav.assumptions : nav.quickCheck[step]}
          </h3>
          <div className="border-l-2 border-primary pl-4 sm:pl-5">
            <LazyCalcExplanation source={STEP_EXPLAIN[step]} />
          </div>
        </div>
      ))}
    </div>
  )
}

"use client"

import { useDictionary } from "../../../_components/i18n-provider"
import { useQuickCheck } from "../../../_components/use-quick-check"
import { MissingSteps } from "../../../_components/missing-steps"
import { RailComplete } from "./rail-complete"

/** The live result next to the inputs (PLAN-DASH-08 step 2): verdict and indicators, or what is missing. */
export function RailSummary({ headingId }: { headingId?: string }) {
  const { result } = useQuickCheck()
  const rail = useDictionary("quick-check").ui.rail
  if (!result) return null
  if (result.status === "complete") return <RailComplete result={result} headingId={headingId} />
  return (
    <div data-slot="rail-summary" data-status="incomplete" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <p id={headingId} className="text-lg leading-tight font-[560] tracking-[-0.03em] [font-stretch:86%]">
          {rail.incomplete.title}
        </p>
        <p className="text-sm leading-relaxed text-text-secondary">{rail.incomplete.body}</p>
      </div>
      <MissingSteps steps={result.incompleteSteps} />
    </div>
  )
}

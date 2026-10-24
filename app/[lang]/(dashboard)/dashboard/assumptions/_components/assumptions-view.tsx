"use client"

import { InfoIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { clearPatch, fieldsOf } from "@/lib/project"
import { STEP_EXPLAIN } from "@/lib/quick-check"
import { useFieldPatch } from "../../_components/fields/use-field-patch"
import { HowWeCalculate } from "../../_components/how-we-calculate"
import { useDictionary } from "../../_components/i18n-provider"
import { useQuickCheck } from "../../_components/use-quick-check"
import { AnswersList } from "./answers-list"
import { AssumptionsSection } from "./assumptions-section"
import { BuildingTables } from "./building-tables"
import { CapacityTable } from "./capacity-table"
import { EconomicTable } from "./economic-table"
import { PlaygroundBar } from "./playground-bar"
import { ResetDialog } from "./reset-dialog"

const RESET = clearPatch(fieldsOf({ module: "quickCheck", step: "assumptions" }))

/**
 * The Assumptions page (D-10): the parameter playground first, then TBL-4/5/6 (editable while
 * playing), TBL-1..3 read-only and the OQ answers in use. Thresholds TBL-7..11 stay fixed.
 * Custom values are stored as overrides in the project; there is no separate "on" flag.
 */
export function AssumptionsView() {
  const copy = useDictionary("assumptions")
  const patch = useFieldPatch()
  const { result } = useQuickCheck()
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  if (!result) return null
  const customCount = result.parameters.customFields.length
  const playing = editing || customCount > 0

  const reset = () => {
    patch(RESET)
    setEditing(false)
    setConfirming(false)
    toast(copy.playground.reset_done)
  }
  const toggle = (next: boolean) => {
    if (next) setEditing(true)
    else if (customCount > 0) setConfirming(true)
    else setEditing(false)
  }

  return (
    <div data-slot="assumptions-view" className="flex flex-col gap-12">
      <PlaygroundBar playing={playing} customCount={customCount} onToggle={toggle} onReset={() => setConfirming(true)} />
      <AssumptionsSection id="assumptions-sources" title={copy.sections.sources}>
        <p className="flex max-w-[72ch] items-start gap-2 text-sm leading-relaxed text-muted-foreground">
          <InfoIcon className="mt-0.5 size-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
          {copy.flags["OQ-26"]}
        </p>
        <div className="flex flex-col gap-8">
          <CapacityTable application="heating" playing={playing} />
          <CapacityTable application="cooling" playing={playing} />
        </div>
      </AssumptionsSection>
      <AssumptionsSection id="assumptions-economic" title={copy.sections.economic}>
        <EconomicTable playing={playing} />
      </AssumptionsSection>
      <AssumptionsSection id="assumptions-buildings" title={copy.sections.buildings}>
        <BuildingTables />
      </AssumptionsSection>
      <AssumptionsSection id="assumptions-answers" title={copy.sections.answers}>
        <AnswersList />
      </AssumptionsSection>
      <HowWeCalculate source={STEP_EXPLAIN.assumptions} className="border-t pt-3" />
      <ResetDialog open={confirming} onOpenChange={setConfirming} onConfirm={reset} />
    </div>
  )
}

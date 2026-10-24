"use client"

import { GroupSection } from "../../../_components/group-section"
import { ItemsSection } from "../../../_components/items-section"
import { QcEconomicsPanel } from "../../../_components/qc/qc-economics-panel"

/**
 * BM-STEP-03 · Run the reality check: rough assumptions in words next to the read-only Quick
 * Check revenue and investment, then the critical assumptions and the risk register with one
 * potential deal-breaker, each with a way to validate it.
 */
export function RealityCheckStep() {
  return (
    <>
      <QcEconomicsPanel />
      <GroupSection groupId="businessPlan.assumptions" index={1} />
      <ItemsSection fieldId="businessPlan.criticalAssumptions" index={2} />
      <ItemsSection fieldId="businessPlan.risks" index={3} />
    </>
  )
}

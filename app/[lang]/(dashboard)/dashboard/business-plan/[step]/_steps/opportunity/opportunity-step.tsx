"use client"

import { GroupSection } from "../../../_components/group-section"
import { QcSitePanel } from "../../../_components/qc/qc-site-panel"
import { ScenarioPicker } from "../../../_components/scenario/scenario-picker"

/**
 * BM-STEP-01 · Define the opportunity: the use case (scenario or own), the site and its shared
 * Quick Check numbers, then customer segments, needs, heat sources, the pain point and why a
 * shared low-temperature network beats the alternatives.
 */
export function OpportunityStep() {
  return (
    <>
      <ScenarioPicker index={1} />
      <QcSitePanel />
      <GroupSection groupId="site" index={2} />
      <GroupSection groupId="businessPlan.opportunity" index={3} />
    </>
  )
}

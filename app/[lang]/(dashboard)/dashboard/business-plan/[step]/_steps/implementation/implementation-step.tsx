"use client"

import { GroupSection } from "../../../_components/group-section"
import { ReadinessPanel } from "../../../_components/readiness/readiness-panel"

/**
 * BM-STEP-04 · Improve and prepare implementation: refinements, scalability by context and the
 * next practical steps, closed by the pitch readiness (D-30).
 */
export function ImplementationStep() {
  return (
    <>
      <GroupSection groupId="businessPlan.refinements" index={1} />
      <GroupSection groupId="businessPlan.scalability" index={2} />
      <GroupSection groupId="businessPlan.nextSteps" index={3} />
      <ReadinessPanel index={4} />
    </>
  )
}

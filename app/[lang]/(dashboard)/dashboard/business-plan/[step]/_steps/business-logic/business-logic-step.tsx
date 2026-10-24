"use client"

import { CanvasSection } from "../../../_components/canvas/canvas-section"
import { CompareModels } from "../../../_components/compare-models"
import { ItemsSection } from "../../../_components/items-section"

/**
 * BM-STEP-02 · Build the business logic: the tailored Business Model Canvas, and who invests,
 * who carries which risk and who benefits. Models are compared by duplicating the project (D-29).
 */
export function BusinessLogicStep() {
  return (
    <>
      <CanvasSection index={1} />
      <ItemsSection fieldId="businessPlan.allocation" index={2} />
      <CompareModels />
    </>
  )
}

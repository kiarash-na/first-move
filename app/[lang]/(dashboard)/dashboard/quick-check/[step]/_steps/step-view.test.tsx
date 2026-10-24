import { describe, expect, it } from "vitest"
import { renderDashboard } from "../../../_components/test-utils/render"
import { exampleProject, projectStore } from "../../../_components/test-utils/project-store"
import { StepView } from "./step-view"

describe("StepView", () => {
  it.each(["area", "buildings", "sources", "options"] as const)("renders the %s step in the step frame", (step) => {
    const { container } = renderDashboard(<StepView step={step} />, { store: projectStore(exampleProject("new-build-quarter")).store })
    expect(container.querySelector("[data-slot=step-layout]")).toHaveAttribute("data-step", step)
    expect(container.querySelector(`[data-slot=${step}-step]`)).not.toBeNull()
  })
})

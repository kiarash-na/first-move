import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import calc from "@/dictionaries/en/calc.json"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { renderDashboard } from "../../../../_components/test-utils/render"
import { emptyProject, exampleProject, projectStore } from "../../../../_components/test-utils/project-store"
import { DensityPreview } from "./density-preview"

describe("DensityPreview (QCT-IN-03, OQ-04)", () => {
  it("waits for both inputs", () => {
    renderDashboard(<DensityPreview />, { store: projectStore(emptyProject()).store })
    expect(screen.getByText(quickCheck.ui.area.pending)).toBeInTheDocument()
  })

  it("shows the density, its TBL-8 class and the derived category with their explanations", () => {
    const { container } = renderDashboard(<DensityPreview />, { store: projectStore(exampleProject("housing-cooperatives")).store })
    expect(screen.getByText("0.8")).toBeInTheDocument()
    expect(container.querySelector("[aria-current=true]")).toHaveTextContent(quickCheck.results.classes.buildingDensity.low.label)
    expect(container.querySelector("[data-category=rural]")).toHaveTextContent("Rural")
    expect(screen.getByRole("button", { name: `${calc.ui.info}: ${quickCheck.derived.densityCategory.label}` })).toBeInTheDocument()
  })
})

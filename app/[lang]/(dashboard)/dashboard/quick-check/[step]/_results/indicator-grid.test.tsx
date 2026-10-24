import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { run, type QuickCheckComplete } from "@/lib/quick-check"
import { renderDashboard } from "../../../_components/test-utils/render"
import { exampleProject, projectStore } from "../../../_components/test-utils/project-store"
import { IndicatorGrid } from "./indicator-grid"

describe("IndicatorGrid (QCT-KF-02)", () => {
  it("has one card per indicator class with the category, network tag and dominant demand", () => {
    const project = exampleProject("rural-village-hotel")
    const { container } = renderDashboard(<IndicatorGrid result={run(project) as QuickCheckComplete} />, { store: projectStore(project).store })
    expect(Array.from(container.querySelectorAll("[data-indicator]")).map((card) => card.getAttribute("data-indicator"))).toEqual([
      "buildingDensity",
      "heatDensity",
      "chRatio",
      "economic",
    ])
    expect(screen.getByText("Category: Rural")).toBeInTheDocument()
    expect(container.querySelector("[data-slot=network-length-tag]")).toHaveAttribute("data-source", "manual")
    expect(screen.getByText(quickCheck.results.dominantDemand.heating.label)).toBeInTheDocument()
    expect(screen.getAllByText(quickCheck.results.classes.heatDensity.low.label).length).toBeGreaterThan(0)
  })
})

import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { run, type QuickCheckComplete } from "@/lib/quick-check"
import { renderDashboard } from "../../../_components/test-utils/render"
import { exampleProject, projectStore } from "../../../_components/test-utils/project-store"
import { RailComplete } from "./rail-complete"

describe("RailComplete", () => {
  it("shows the verdict and the four indicators with coverage per demand (KF-04)", () => {
    const project = exampleProject("housing-cooperatives")
    const result = run(project) as QuickCheckComplete
    const { container } = renderDashboard(<RailComplete result={result} />, { store: projectStore(project).store })
    expect(container.querySelector("[data-level]")).toHaveAttribute("data-level", "further_analysis")
    expect(container.querySelectorAll("[data-slot=rail-indicator]")).toHaveLength(5)
    expect(screen.getByText(`${quickCheck.ui.rail.indicators.coverage} · ${quickCheck.results.demands.cooling.label}`)).toBeInTheDocument()
    expect(screen.getByText(quickCheck.results.classes.buildingDensity.low.label)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: quickCheck.ui.rail.open })).toHaveAttribute("href", "/en/dashboard/quick-check/results")
    expect(screen.getByText(quickCheck.ui.rail.screening)).toBeInTheDocument()
  })
})

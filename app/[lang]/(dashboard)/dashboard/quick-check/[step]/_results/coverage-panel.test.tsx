import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { run, type QuickCheckComplete } from "@/lib/quick-check"
import { renderDashboard } from "../../../_components/test-utils/render"
import { exampleProject, projectStore } from "../../../_components/test-utils/project-store"
import { CoveragePanel } from "./coverage-panel"

describe("CoveragePanel (QCT-KF-04)", () => {
  it("shows heating and cooling side by side", () => {
    const project = exampleProject("office-retail-block")
    const { container } = renderDashboard(<CoveragePanel result={run(project) as QuickCheckComplete} />, { store: projectStore(project).store })
    expect(screen.getByRole("heading", { name: quickCheck.ui.results.coverage.title })).toBeInTheDocument()
    expect(Array.from(container.querySelectorAll("[data-demand]")).map((card) => card.getAttribute("data-demand"))).toEqual(["heating", "cooling"])
  })
})

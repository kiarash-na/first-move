import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { applyPatch } from "@/lib/project"
import { run, type QuickCheckComplete } from "@/lib/quick-check"
import { renderDashboard } from "../../../_components/test-utils/render"
import { exampleProject, projectStore } from "../../../_components/test-utils/project-store"
import { CoverageCard } from "./coverage-card"

const setup = (patch: Record<string, unknown> = {}) => {
  const project = applyPatch(exampleProject("school-kindergarten-flats"), patch, { atomic: true }).project
  return { project, result: run(project) as QuickCheckComplete }
}

describe("CoverageCard (QCT-KF-03/04)", () => {
  it("shows value, TBL-7 class and meaning, supply and demand with info popovers", () => {
    const { project, result } = setup()
    const { container } = renderDashboard(<CoverageCard demand="heating" result={result} />, { store: projectStore(project).store })
    expect(screen.getByText("126%")).toBeInTheDocument()
    expect(screen.getByText(quickCheck.results.classes.coverage.feasible.interpretation)).toBeInTheDocument()
    expect(screen.getByText("613 MWh/a")).toBeInTheDocument()
    expect(container.querySelectorAll("button[aria-label^='How we calculate this']")).toHaveLength(3)
  })

  it("names an entered demand and a demand that is not relevant", () => {
    const { project, result } = setup({ "quickCheck.manualDemand.coolingKwhPerYear": 0 })
    renderDashboard(<CoverageCard demand="cooling" result={result} />, { store: projectStore(project).store })
    expect(screen.getByText(quickCheck.results.classes.notRelevant.label)).toBeInTheDocument()
    expect(screen.getAllByText(quickCheck.ui.results.coverage.manual).length).toBeGreaterThan(0)
  })
})

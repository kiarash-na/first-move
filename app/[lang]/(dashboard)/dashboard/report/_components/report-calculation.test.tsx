import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { testDictionaries } from "../../_components/test-utils/dictionaries"
import { exampleProject, projectStore } from "../../_components/test-utils/project-store"
import { renderDashboard } from "../../_components/test-utils/render"
import { ReportCalculation } from "./report-calculation"

describe("ReportCalculation (D-33)", () => {
  it("writes out the explanation of every input step and of the assumptions, with the formulas", async () => {
    const project = exampleProject("housing-cooperatives")
    const { container } = renderDashboard(<ReportCalculation />, { store: projectStore(project).store })
    const { shell, calc } = testDictionaries()
    for (const step of ["area", "buildings", "sources", "options"] as const) {
      expect(screen.getByRole("heading", { level: 3, name: shell.nav.items.quickCheck[step] })).toBeInTheDocument()
    }
    expect(screen.getByRole("heading", { level: 3, name: shell.nav.items.assumptions })).toBeInTheDocument()
    expect(await screen.findByText(calc.steps.area)).toBeInTheDocument()
    expect(await screen.findByText(calc.steps.assumptions)).toBeInTheDocument()
    expect(container.querySelectorAll("math").length).toBeGreaterThan(10)
  })
})

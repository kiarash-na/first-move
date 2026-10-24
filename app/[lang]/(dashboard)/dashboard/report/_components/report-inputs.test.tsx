import { screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { testDictionaries } from "../../_components/test-utils/dictionaries"
import { exampleProject, projectStore } from "../../_components/test-utils/project-store"
import { renderDashboard } from "../../_components/test-utils/render"
import { ReportInputs } from "./report-inputs"

describe("ReportInputs", () => {
  it("prints one table per Quick Check step with the labels and values entered", () => {
    const project = exampleProject("housing-cooperatives")
    const { container } = renderDashboard(<ReportInputs project={project} />, { store: projectStore(project).store })
    const { shell, "quick-check": quickCheck } = testDictionaries()
    for (const step of ["area", "buildings", "sources", "options"] as const) {
      expect(screen.getByRole("heading", { level: 3, name: shell.nav.items.quickCheck[step] })).toBeInTheDocument()
    }
    const area = screen.getByRole("heading", { level: 3, name: shell.nav.items.quickCheck.area }).parentElement!
    expect(within(area).getByText(quickCheck.fields.buildings.total.label)).toBeInTheDocument()
    expect(container.querySelector("[data-slot=report-inputs]")?.textContent).toContain(quickCheck.buildingTypes.residential.label)
  })
})

import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { applyPatch } from "@/lib/project"
import { testDictionaries } from "../../_components/test-utils/dictionaries"
import { emptyProject, exampleProject, projectStore } from "../../_components/test-utils/project-store"
import { renderDashboard } from "../../_components/test-utils/render"
import { ReportView } from "./report-view"

describe("ReportView (D-09, D-70)", () => {
  it("is a light sheet with the project, the Quick Check result, inputs, parameters, equations and the footer", () => {
    const project = exampleProject("housing-cooperatives")
    const { container } = renderDashboard(<ReportView />, { store: projectStore(project).store })
    const { report } = testDictionaries()
    const sheet = container.querySelector("[data-slot=report]")
    expect(sheet).toHaveAttribute("data-theme", "light")
    expect(screen.getByRole("heading", { level: 1, name: project.meta.name })).toBeInTheDocument()
    for (const title of [report.sections.quickCheck, report.sections.inputs, report.sections.parameters, report.sections.calculation]) {
      expect(screen.getByRole("region", { name: title })).toBeInTheDocument()
    }
    expect(container.querySelector("[data-slot=verdict-panel]") ?? container.querySelector("[data-slot=key-figures]")).not.toBeNull()
    expect(container.querySelector("[data-slot=report-footer]")).not.toBeNull()
    expect(screen.getByRole("region", { name: report.sections.businessPlan })).toHaveClass("print:break-before-page")
  })

  it("adds the Business Plan and its pitch readiness when the module is on, and leaves out what is off", () => {
    const { report } = testDictionaries()
    const withPlan = applyPatch(exampleProject("housing-cooperatives"), { "meta.modules.businessPlan": true, "meta.modules.quickCheck": false }).project
    renderDashboard(<ReportView />, { store: projectStore(withPlan).store })
    // Nothing comes before it, so it does not start on a new page (no lonely header page).
    expect(screen.getByRole("region", { name: report.sections.businessPlan })).not.toHaveClass("print:break-before-page")
    expect(screen.getByRole("region", { name: report.sections.readiness })).toBeInTheDocument()
    expect(screen.queryByRole("region", { name: report.sections.quickCheck })).not.toBeInTheDocument()
  })

  it("prints what is missing instead of a result for an incomplete Quick Check", () => {
    const { container } = renderDashboard(<ReportView />, { store: projectStore(emptyProject()).store })
    expect(container.querySelector("[data-slot=results-incomplete]")).not.toBeNull()
    expect(container.querySelector("[data-slot=key-figures]")).toBeNull()
  })
})

import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { applyPatch } from "@/lib/project"
import { testDictionaries } from "../../_components/test-utils/dictionaries"
import { exampleProject, projectStore } from "../../_components/test-utils/project-store"
import { renderDashboard } from "../../_components/test-utils/render"
import { ReportParameters } from "./report-parameters"

describe("ReportParameters (D-10)", () => {
  it("prints Tables 4, 5 and 6 read-only", () => {
    const project = exampleProject("housing-cooperatives")
    const { container } = renderDashboard(<ReportParameters />, { store: projectStore(project).store })
    expect([...container.querySelectorAll("[data-slot=capacity-table]")].map((table) => table.getAttribute("data-table"))).toEqual(["TBL-4", "TBL-5"])
    expect(container.querySelector("[data-slot=economic-table]")).not.toBeNull()
    expect(container.querySelector("input")).toBeNull()
    expect(screen.getByRole("columnheader", { name: testDictionaries().assumptions.tables.value })).toBeInTheDocument()
  })

  it("prints the custom values the result uses, marked, under \"Value used\" (D-10)", () => {
    const project = applyPatch(exampleProject("housing-cooperatives"), {
      "quickCheck.overrides.economic.interest_rate": 9.75,
      "quickCheck.overrides.heating.geothermal.low": 12345,
    }).project
    const { container } = renderDashboard(<ReportParameters />, { store: projectStore(project).store })
    const custom = [...container.querySelectorAll("[data-custom]")].map((cell) => cell.textContent)
    expect(custom).toEqual(["12,345 (Your value)", "9.75 (Your value)"])
    expect(screen.getByRole("columnheader", { name: testDictionaries().assumptions.tables.used })).toBeInTheDocument()
  })
})

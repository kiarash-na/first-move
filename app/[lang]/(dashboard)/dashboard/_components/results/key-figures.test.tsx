import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { run, type QuickCheckComplete } from "@/lib/quick-check"
import { testDictionaries } from "../test-utils/dictionaries"
import { renderDashboard } from "../test-utils/render"
import { exampleProject, projectStore } from "../test-utils/project-store"
import { KeyFigures } from "./key-figures"

describe("KeyFigures (D-33)", () => {
  it("gives every value its info popover, formatted per language", () => {
    const { calc, "quick-check": quickCheck } = testDictionaries("de")
    const project = exampleProject("school-kindergarten-flats")
    const { container } = renderDashboard(<KeyFigures result={run(project) as QuickCheckComplete} />, { store: projectStore(project).store, lang: "de" })
    const rows = container.querySelectorAll("[data-figure]")
    expect(rows).toHaveLength(12)
    for (const row of rows) expect(row.querySelector(`button[aria-label^="${calc.ui.info}"]`)).not.toBeNull()
    expect(container.querySelector("[data-figure=overallInvestment]")).toHaveTextContent("527.944 €")
    expect(container.querySelector("[data-figure=annualCosts]")).toHaveTextContent(/€\/a$/)
    expect(screen.getByText(quickCheck.ui.results.network.estimated)).toBeInTheDocument()
  })

  it("keeps valid definition-list groups: only dt and dd inside each row, the info button inside the dd", () => {
    const project = exampleProject("school-kindergarten-flats")
    const { container } = renderDashboard(<KeyFigures result={run(project) as QuickCheckComplete} />, { store: projectStore(project).store })
    for (const row of container.querySelectorAll("dl > div")) {
      expect(Array.from(row.children).map((child) => child.tagName)).toEqual(["DT", "DD"])
      expect(row.querySelector("dd button")).not.toBeNull()
    }
  })
})

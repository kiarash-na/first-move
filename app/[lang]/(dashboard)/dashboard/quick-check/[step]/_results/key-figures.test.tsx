import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import calc from "@/dictionaries/en/calc.json"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { run, type QuickCheckComplete } from "@/lib/quick-check"
import { renderDashboard } from "../../../_components/test-utils/render"
import { exampleProject, projectStore } from "../../../_components/test-utils/project-store"
import { KeyFigures } from "./key-figures"

describe("KeyFigures (D-33)", () => {
  it("gives every value its info popover, formatted per language", () => {
    const project = exampleProject("school-kindergarten-flats")
    const { container } = renderDashboard(<KeyFigures result={run(project) as QuickCheckComplete} />, { store: projectStore(project).store, lang: "de" })
    const rows = container.querySelectorAll("[data-figure]")
    expect(rows).toHaveLength(12)
    for (const row of rows) expect(row.querySelector(`button[aria-label^="${calc.ui.info}"]`)).not.toBeNull()
    expect(container.querySelector("[data-figure=overallInvestment]")).toHaveTextContent("527.944 €")
    expect(container.querySelector("[data-figure=annualCosts]")).toHaveTextContent(/€\/a$/)
    expect(screen.getByText(quickCheck.ui.results.network.estimated)).toBeInTheDocument()
  })
})

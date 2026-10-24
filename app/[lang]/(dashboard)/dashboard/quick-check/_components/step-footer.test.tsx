import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { renderDashboard } from "../../_components/test-utils/render"
import { emptyProject, projectStore } from "../../_components/test-utils/project-store"
import { StepFooter } from "./step-footer"

describe("StepFooter", () => {
  it("has no back link on the first step", () => {
    renderDashboard(<StepFooter step="area" />, { store: projectStore(emptyProject()).store })
    expect(screen.queryByRole("link", { name: quickCheck.ui.footer.previous })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Next: Buildings" })).toHaveAttribute("href", "/en/dashboard/quick-check/buildings")
  })

  it("leads from the last step to the results", () => {
    renderDashboard(<StepFooter step="options" />, { store: projectStore(emptyProject()).store, lang: "de" })
    expect(screen.getByRole("link", { name: quickCheck.ui.footer.previous })).toHaveAttribute("href", "/de/dashboard/quick-check/sources")
    expect(screen.getByRole("link", { name: quickCheck.ui.footer.results })).toHaveAttribute("href", "/de/dashboard/quick-check/results")
  })
})

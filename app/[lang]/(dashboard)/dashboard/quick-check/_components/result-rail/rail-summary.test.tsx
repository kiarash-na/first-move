import { act, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { renderDashboard } from "../../../_components/test-utils/render"
import { emptyProject, exampleProject, projectStore } from "../../../_components/test-utils/project-store"
import { RailSummary } from "./rail-summary"

describe("RailSummary (PLAN-DASH-08 step 2)", () => {
  it("lists the missing steps while there is no result", () => {
    const { store } = projectStore(emptyProject())
    const { container } = renderDashboard(<RailSummary />, { store })
    expect(container.querySelector("[data-status=incomplete]")).not.toBeNull()
    expect(screen.getByText(quickCheck.ui.rail.incomplete.title)).toBeInTheDocument()
    expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "/en/dashboard/quick-check/area",
      "/en/dashboard/quick-check/buildings",
      "/en/dashboard/quick-check/sources",
    ])
  })

  it("updates live when an input changes", () => {
    const { store, patch } = projectStore(exampleProject("school-kindergarten-flats"))
    const { container } = renderDashboard(<RailSummary />, { store })
    expect(container.querySelector("[data-status=complete]")).toHaveAttribute("data-level", "promising")
    act(() => {
      patch({ "sources.potentials.ground_water": "unknown" })
    })
    expect(container.querySelector("[data-status=complete]")).toHaveAttribute("data-level", "further_analysis")
    expect(screen.getByText(quickCheck.ui.results.forced)).toBeInTheDocument()
  })
})

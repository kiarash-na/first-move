import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { renderDashboard } from "../../../_components/test-utils/render"
import { emptyProject, exampleProject, projectStore } from "../../../_components/test-utils/project-store"
import { MobileRail } from "./mobile-rail"

describe("MobileRail (collapses up to 1100px)", () => {
  it("shows the verdict collapsed and the details on demand", async () => {
    renderDashboard(<MobileRail />, { store: projectStore(exampleProject("thermal-spa-hotels")).store })
    const toggle = screen.getByRole("button", { name: new RegExp(quickCheck.ui.rail.toggle) })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(toggle).toHaveTextContent(quickCheck.results.levels.further_analysis.label)
    await userEvent.click(toggle)
    expect(screen.getByText(quickCheck.ui.results.forced)).toBeVisible()
  })

  it("says when there is no result yet", () => {
    renderDashboard(<MobileRail />, { store: projectStore(emptyProject()).store })
    expect(screen.getByRole("button")).toHaveTextContent(quickCheck.ui.rail.incomplete.title)
  })
})

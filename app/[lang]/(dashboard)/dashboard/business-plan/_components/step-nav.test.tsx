import { screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { renderDashboard } from "../../_components/test-utils/render"
import { openProject, stopTabs } from "./test-utils/open-project"
import { StepNav } from "./step-nav"

afterEach(stopTabs)

describe("StepNav (BM-SCOPE-11, D-28)", () => {
  it.each(["en", "de"] as const)("links all four steps in any order with progress per step (%s)", async (lang) => {
    const tab = await openProject()
    tab.store.patch({ "site.name": "Village", "businessPlan.scalability.geographical": "Other valleys" })
    renderDashboard(<StepNav current="business-logic" />, { store: tab.store, lang })
    const nav = screen.getByRole("navigation", { name: "Business Plan steps" })
    const links = within(nav).getAllByRole("link")
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      ["opportunity", "business-logic", "reality-check", "implementation"].map((step) => `/${lang}/dashboard/business-plan/${step}`),
    )
    expect(links[1]).toHaveAttribute("aria-current", "step")
    expect(links[0]).not.toHaveAttribute("aria-current")
    expect(within(links[0]).getByText(/^1 of \d+ filled in$/)).toBeInTheDocument()
    expect(within(links[2]).getByText(/^0 of \d+ filled in$/)).toBeInTheDocument()
    expect(within(links[3]).getByText(/^1 of \d+ filled in$/)).toBeInTheDocument()
  })

  it("marks a finished step as done", async () => {
    const tab = await openProject({ example: "housing-cooperatives" })
    renderDashboard(<StepNav current="opportunity" />, { store: tab.store })
    expect(screen.getAllByText("Done")).toHaveLength(4)
    expect(screen.getAllByText("100%")).toHaveLength(4)
  })
})

import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { renderDashboard } from "../../../../_components/test-utils/render"
import { openProject, stopTabs } from "../../../_components/test-utils/open-project"
import { OpportunityStep } from "./opportunity-step"

afterEach(stopTabs)

describe("OpportunityStep (BM-STEP-01)", () => {
  it("offers the scenario picker, the site, the opportunity and the shared Quick Check numbers", async () => {
    const tab = await openProject({ example: "rural-village-hotel" })
    renderDashboard(<OpportunityStep />, { store: tab.store })
    expect(screen.getByRole("region", { name: "Start from a use case" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "From the Quick Check" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Site or district" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "The opportunity" })).toBeInTheDocument()
    expect(screen.getByLabelText("Customer segments")).toHaveValue(tab.store.getState().active!.businessPlan.opportunity.customerSegments)
  })

  it("edits the site and the opportunity through the store", async () => {
    const tab = await openProject()
    renderDashboard(<OpportunityStep />, { store: tab.store })
    await userEvent.type(screen.getByLabelText("Name of the site or district"), "Valley")
    await userEvent.type(screen.getByLabelText("Key pain point"), "Old boilers")
    const project = tab.store.getState().active!
    expect(project.site.name).toBe("Valley")
    expect(project.businessPlan.opportunity.painPoint).toBe("Old boilers")
  })

  it("shows the link to the Quick Check instead of numbers when the module is off", async () => {
    const tab = await openProject()
    renderDashboard(<OpportunityStep />, { store: tab.store })
    expect(screen.getByRole("link", { name: /Open Quick Check/ })).toHaveAttribute("href", "/en/dashboard/quick-check/area")
  })
})

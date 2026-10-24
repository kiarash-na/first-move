import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { renderDashboard } from "../../../_components/test-utils/render"
import { openProject, stopTabs } from "../test-utils/open-project"
import { ScenarioPicker } from "./scenario-picker"

afterEach(stopTabs)

const choose = async (card: RegExp | string) =>
  userEvent.click(within(screen.getByRole("article", { name: card })).getByRole("button"))

describe("ScenarioPicker (OQ-25, BM-SCOPE-05/06)", () => {
  it("shows the four scenarios and a custom use case", async () => {
    const tab = await openProject()
    renderDashboard(<ScenarioPicker index={1} />, { store: tab.store })
    expect(screen.getAllByRole("article")).toHaveLength(5)
  })

  it("prefills only the stated site fields and records the scenario", async () => {
    const tab = await openProject()
    tab.store.patch({ "site.name": "My village", "businessPlan.opportunity.painPoint": "Gas prices" })
    renderDashboard(<ScenarioPicker />, { store: tab.store })
    await choose(/Scenario 03/)
    const project = tab.store.getState().active!
    expect(project.businessPlan.scenarioId).toBe("BM-SCN-03")
    expect(project.site.stakeholders).toEqual(["Private homeowners", "Housing cooperatives", "Municipality", "Educational facilities"])
    expect(project.site.currentSupply).toEqual(["Natural gas", "Biomass"])
    expect(project.site.units).toBe("3-20 buildings")
    // not stated by the scenario: left alone
    expect(project.site.name).toBe("My village")
    expect(project.site.partners).toEqual([])
    expect(project.businessPlan.opportunity.painPoint).toBe("Gas prices")
    expect(screen.getByRole("article", { name: /Scenario 03/ })).toHaveAttribute("data-selected", "true")
  })

  it("asks before it replaces text the team wrote, and keeps it on cancel", async () => {
    const tab = await openProject()
    tab.store.patch({ "site.siteType": "My own site type" })
    renderDashboard(<ScenarioPicker />, { store: tab.store })
    await choose(/Scenario 01/)
    const dialog = screen.getByRole("alertdialog", { name: "Replace your text?" })
    expect(dialog).toHaveTextContent("Type of site")
    await userEvent.click(within(dialog).getByRole("button", { name: "Keep my text" }))
    expect(tab.store.getState().active?.site.siteType).toBe("My own site type")
    expect(tab.store.getState().active?.businessPlan.scenarioId).toBeNull()
    await choose(/Scenario 01/)
    await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Replace" }))
    expect(tab.store.getState().active?.site.siteType).toBe("Rural village")
    expect(tab.store.getState().active?.businessPlan.scenarioId).toBe("BM-SCN-01")
  })

  it("a custom use case prefills nothing and never asks", async () => {
    const tab = await openProject()
    tab.store.patch({ "site.siteType": "Mine", "site.stakeholders": ["Me"] })
    renderDashboard(<ScenarioPicker />, { store: tab.store })
    await choose(/Your own use case/)
    expect(screen.queryByRole("alertdialog")).toBeNull()
    const project = tab.store.getState().active!
    expect(project.businessPlan.scenarioId).toBe("custom")
    expect(project.site.siteType).toBe("Mine")
    expect(project.site.stakeholders).toEqual(["Me"])
  })
})

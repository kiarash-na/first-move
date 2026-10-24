import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { renderDashboard } from "../../../../_components/test-utils/render"
import { openProject, stopTabs } from "../../../_components/test-utils/open-project"
import { RealityCheckStep } from "./reality-check-step"

afterEach(stopTabs)

describe("RealityCheckStep (BM-STEP-03)", () => {
  it("shows the read-only Quick Check economics next to the assumptions, critical assumptions and risks", async () => {
    const tab = await openProject({ example: "housing-cooperatives" })
    renderDashboard(<RealityCheckStep />, { store: tab.store })
    expect(screen.getByRole("region", { name: "From the Quick Check" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Rough assumptions" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Critical assumptions" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Risks" })).toBeInTheDocument()
    expect(screen.getAllByRole("switch", { name: "Potential deal-breaker" })).toHaveLength(tab.store.getState().active!.businessPlan.risks.length)
    expect(screen.getAllByRole("switch", { name: "Potential deal-breaker" }).filter((el) => el.getAttribute("aria-checked") === "true")).toHaveLength(1)
  })

  it("records an assumption, a critical assumption with its validation and a deal-breaker", async () => {
    const tab = await openProject()
    renderDashboard(<RealityCheckStep />, { store: tab.store })
    await userEvent.type(screen.getByLabelText("Connection rate"), "60% in year 3")
    await userEvent.click(screen.getByRole("button", { name: "Add critical assumption" }))
    await userEvent.type(screen.getByLabelText("Assumption"), "Most owners connect")
    await userEvent.type(screen.getAllByLabelText("How to validate it")[0], "Owner survey")
    await userEvent.click(screen.getByRole("button", { name: "Add risk" }))
    await userEvent.click(screen.getByRole("switch", { name: "Potential deal-breaker" }))
    const project = tab.store.getState().active!
    expect(project.businessPlan.assumptions.connectionRate).toBe("60% in year 3")
    expect(project.businessPlan.criticalAssumptions[0]).toMatchObject({ statement: "Most owners connect", validation: "Owner survey" })
    expect(project.businessPlan.risks[0].dealBreaker).toBe(true)
  })

  it("works without the Quick Check module, with a link to it", async () => {
    const tab = await openProject()
    renderDashboard(<RealityCheckStep />, { store: tab.store })
    expect(screen.getByRole("link", { name: /Open Quick Check/ })).toBeInTheDocument()
    expect(screen.getByLabelText("Tariffs")).toBeInTheDocument()
  })
})

import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { renderDashboard } from "../../../../_components/test-utils/render"
import { openProject, stopTabs } from "../../../_components/test-utils/open-project"
import { BusinessLogicStep } from "./business-logic-step"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/" }))
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() }, Toaster: () => null }))

afterEach(stopTabs)

describe("BusinessLogicStep (BM-STEP-02)", () => {
  it("has the canvas, the allocation of investment, risk and benefit, and the compare note", async () => {
    const tab = await openProject({ example: "housing-cooperatives" })
    renderDashboard(<BusinessLogicStep />, { store: tab.store })
    expect(screen.getByRole("region", { name: "Business Model Canvas" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Allocation of investment, risk and benefit" })).toBeInTheDocument()
    expect(screen.getAllByRole("article")).toHaveLength(tab.store.getState().active!.businessPlan.allocation.length)
    expect(screen.getByRole("button", { name: "Duplicate project" })).toBeInTheDocument()
  })

  it("edits a canvas block and an allocation row, stored as typed", async () => {
    const tab = await openProject()
    renderDashboard(<BusinessLogicStep />, { store: tab.store })
    await userEvent.type(screen.getByLabelText("Value proposition"), "Stable heat prices")
    await userEvent.click(screen.getByRole("button", { name: "Add stakeholder" }))
    await userEvent.type(screen.getByLabelText("Stakeholder"), "Utility")
    await userEvent.type(screen.getByLabelText("Investment"), "Source and pipes")
    const project = tab.store.getState().active!
    expect(project.businessPlan.canvas.valueProposition).toBe("Stable heat prices")
    expect(project.businessPlan.allocation[0]).toMatchObject({ stakeholder: "Utility", investment: "Source and pipes", risk: "", benefit: "" })
  })
})

import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { CANVAS_BLOCKS, FOCUS_CANVAS_BLOCKS } from "@/lib/project"
import { renderDashboard } from "../../../_components/test-utils/render"
import { openProject, stopTabs } from "../test-utils/open-project"
import { CanvasSection } from "./canvas-section"

afterEach(stopTabs)

describe("CanvasSection (BM-STEP-02)", () => {
  it("has one editable block per canvas block, in the tailored canvas of 10", async () => {
    const tab = await openProject()
    renderDashboard(<CanvasSection index={1} />, { store: tab.store })
    expect(screen.getByRole("region", { name: "Business Model Canvas" })).toBeInTheDocument()
    expect(screen.getAllByRole("textbox")).toHaveLength(CANVAS_BLOCKS.length)
    expect(CANVAS_BLOCKS).toHaveLength(10)
  })

  it("tags the blocks that BM-STEP-02 asks for particular attention to", async () => {
    const tab = await openProject()
    renderDashboard(<CanvasSection />, { store: tab.store })
    expect(screen.getAllByText("Focus")).toHaveLength(FOCUS_CANVAS_BLOCKS.length)
  })

  it("shows the operator help and stores each block as typed", async () => {
    const tab = await openProject()
    renderDashboard(<CanvasSection />, { store: tab.store })
    expect(screen.getByText(/Who owns and operates the source/)).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText("Revenue streams"), "Base price{Enter}Energy price")
    expect(tab.store.getState().active?.businessPlan.canvas.revenueStreams).toBe("Base price\nEnergy price")
  })

  it("places the blocks in the classic canvas layout once the panel is wide", async () => {
    const tab = await openProject()
    renderDashboard(<CanvasSection />, { store: tab.store })
    const cell = screen.getByLabelText("Value proposition").closest("div.bg-card")!
    expect(cell.className).toContain("@4xl:col-start-5")
    expect(cell.className).toContain("@4xl:row-span-2")
  })
})

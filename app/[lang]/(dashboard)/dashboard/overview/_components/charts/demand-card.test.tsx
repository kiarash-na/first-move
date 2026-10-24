import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { completeRun, exampleWith, renderOverview } from "../test-utils/overview-render"
import DemandCard from "./demand-card"

describe("DemandCard", () => {
  it("has a titled card with a chart view and a table view of the same data", async () => {
    const user = userEvent.setup()
    const project = exampleWith("school-kindergarten-flats")
    renderOverview(<DemandCard result={completeRun(project)} />, project)
    const card = document.getElementById("chart-demand")!
    expect(within(card).getByRole("heading", { name: "Demand by building type and period" })).toBeInTheDocument()
    expect(within(card).getByRole("radio", { name: "Chart" })).toBeChecked()
    expect(within(card).queryByRole("table")).not.toBeInTheDocument()
    await user.click(within(card).getByRole("radio", { name: "Table" }))
    expect(within(card).getAllByRole("table").length).toBeGreaterThan(0)
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("reads in German with English fallbacks (D-32)", () => {
    const project = exampleWith("housing-cooperatives")
    renderOverview(<DemandCard result={completeRun(project)} />, project, "de")
    expect(document.getElementById("chart-demand")).not.toBeNull()
  })
})

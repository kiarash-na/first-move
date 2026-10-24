import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { completeRun, exampleWith, renderOverview } from "../test-utils/overview-render"
import { CoverageChartCard } from "./coverage-chart-card"

describe("CoverageChartCard", () => {
  it("has a titled card with a chart view and a table view of the same data", async () => {
    const user = userEvent.setup()
    const project = exampleWith("school-kindergarten-flats")
    renderOverview(<CoverageChartCard result={completeRun(project)} />, project)
    const card = document.getElementById("chart-coverage")!
    expect(within(card).getByRole("heading", { name: "Coverage against demand" })).toBeInTheDocument()
    expect(within(card).getByRole("radio", { name: "Chart" })).toBeChecked()
    expect(within(card).queryByRole("table")).not.toBeInTheDocument()
    await user.click(within(card).getByRole("radio", { name: "Table" }))
    expect(within(card).getAllByRole("table").length).toBeGreaterThan(0)
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("reads in German with English fallbacks (D-32)", () => {
    const project = exampleWith("housing-cooperatives")
    renderOverview(<CoverageChartCard result={completeRun(project)} />, project, "de")
    expect(document.getElementById("chart-coverage")).not.toBeNull()
  })
})

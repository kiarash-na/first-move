import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { completeRun, exampleWith, renderOverview } from "../test-utils/overview-render"
import { MORE_CHART_IDS, MoreCharts } from "./more-charts"

describe("MoreCharts", () => {
  it("offers three charts and loads none until one is chosen", () => {
    const project = exampleWith("school-kindergarten-flats")
    renderOverview(<MoreCharts result={completeRun(project)} />, project)
    expect(MORE_CHART_IDS).toEqual(["demand", "supply", "cost"])
    expect(screen.getAllByRole("radio")).toHaveLength(3)
    expect(document.querySelector("[data-slot=chart-card]")).toBeNull()
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("shows a loading state, then the chart, when one is chosen", async () => {
    const user = userEvent.setup()
    const project = exampleWith("school-kindergarten-flats")
    renderOverview(<MoreCharts result={completeRun(project)} />, project)
    await user.click(screen.getByRole("radio", { name: "Supply per source" }))
    // The chart module loads lazily; under full-suite load that can take longer than waitFor's 1 s default.
    await waitFor(() => expect(document.getElementById("chart-supply")).not.toBeNull(), { timeout: 10_000 })
  }, 15_000)
})

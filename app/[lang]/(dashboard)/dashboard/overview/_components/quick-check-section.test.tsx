import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { completeRun, exampleWith, renderOverview } from "./test-utils/overview-render"
import { QuickCheckSection } from "./quick-check-section"

describe("QuickCheckSection", () => {
  it("lists verdict, key numbers, indicators, charts and the screening line in reading order", () => {
    const project = exampleWith("office-retail-block")
    renderOverview(<QuickCheckSection result={completeRun(project)} />, project)
    const names = screen.getAllByRole("region").map((region) => region.getAttribute("data-slot"))
    expect(names.slice(0, 4)).toEqual(["verdict-hero", "kpi-grid", "tile-grid", "charts-section"])
    expect(screen.getByText(/Screening, not a full feasibility study/)).toBeInTheDocument()
  })
})

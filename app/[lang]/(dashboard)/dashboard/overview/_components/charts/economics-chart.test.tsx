import { describe, expect, it } from "vitest"
import { economicsData } from "@/lib/dashboard/overview"
import { ECONOMICS_SERIES } from "./economics-series"
import { completeRun, exampleWith, renderOverview } from "../test-utils/overview-render"
import EconomicsChart from "./economics-chart"

const project = exampleWith("school-kindergarten-flats")
const result = completeRun(project)

describe("EconomicsChart", () => {
  it("renders a colour per part and a hatch for the third part of each stack", () => {
    const { container } = renderOverview(<EconomicsChart data={economicsData(result)} />, project)
    const chart = container.querySelector("[data-chart=chart-economics]")!
    expect(chart).not.toBeNull()
    expect(chart.querySelector("style")!.innerHTML).toContain("--color-revenue-base: var(--chart-1)")
    expect(chart.querySelector("style")!.innerHTML).toContain("--color-cost-annualized: var(--chart-2)")
    expect(ECONOMICS_SERIES.filter((series) => series.hatched)).toHaveLength(2)
  })
})

import { describe, expect, it } from "vitest"
import { costStructure, demandByType, economicsData, investmentParts, supplyBySource } from "@/lib/dashboard/overview"
import { ECONOMICS_SERIES } from "./economics-series"
import { completeRun, exampleWith, renderOverview } from "../test-utils/overview-render"
import CostChart from "./cost-chart"
import DemandChart from "./demand-chart"
import EconomicsChart from "./economics-chart"
import InvestmentChart from "./investment-chart"
import SupplyChart from "./supply-chart"

const project = exampleWith("school-kindergarten-flats")
const result = completeRun(project)

describe("Recharts charts", () => {
  it("renders the economics chart with a colour per part and a hatch for the third part of each stack", () => {
    const { container } = renderOverview(<EconomicsChart data={economicsData(result)} />, project)
    const chart = container.querySelector("[data-chart=chart-economics]")!
    expect(chart).not.toBeNull()
    expect(chart.querySelector("style")!.innerHTML).toContain("--color-revenue-base: var(--chart-1)")
    expect(chart.querySelector("style")!.innerHTML).toContain("--color-cost-annualized: var(--chart-2)")
    expect(ECONOMICS_SERIES.filter((series) => series.hatched)).toHaveLength(2)
  })

  it("renders the investment chart in orange", () => {
    const { container } = renderOverview(<InvestmentChart parts={investmentParts(result)} />, project)
    expect(container.querySelector("[data-chart=chart-investment] style")!.innerHTML).toContain("--color-value: var(--chart-2)")
  })

  it("renders the demand chart with one ordinal ramp of the signal colour", () => {
    const data = demandByType(result)
    const { container } = renderOverview(<DemandChart rows={data.heating} tone="hot" />, project)
    const css = container.querySelector("[data-chart=chart-demand-hot] style")!.innerHTML
    expect(css).toContain("--color-until_1919: color-mix(in oklab, var(--accent-hot)")
    expect(css).toContain("--color-2011_today")
  })

  it("renders the supply and cost charts", () => {
    const supply = renderOverview(<SupplyChart data={supplyBySource(result)} />, project)
    expect(supply.container.querySelector("[data-chart=chart-supply]")).not.toBeNull()
    supply.unmount()
    const cost = renderOverview(<CostChart data={costStructure(result)} />, project)
    expect(cost.container.querySelector("[data-chart=chart-cost-annual]")).not.toBeNull()
    expect(cost.container.querySelector("[data-chart=chart-cost-investment]")).not.toBeNull()
  })
})

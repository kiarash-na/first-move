import { describe, expect, it } from "vitest"
import { EXAMPLES, localizeExample } from "@/lib/examples"
import { run, type QuickCheckComplete } from "@/lib/quick-check"
import { costStructure, coverageRows, demandByType, economicsData, investmentParts, supplyBySource } from "./chart-data"

function example(id: string): QuickCheckComplete {
  const result = run(localizeExample(EXAMPLES.find((entry) => entry.id === id)!, "en"))
  if (result.status !== "complete") throw new Error(`${id} is incomplete`)
  return result
}

describe.each(EXAMPLES.map((entry) => entry.id))("overview chart data of %s", (id) => {
  const result = example(id)

  it("keeps supply and demand of the engine and their coverage", () => {
    const [heating, cooling] = coverageRows(result)
    expect(heating).toEqual({ demand: "heating", supplyKwh: result.values.heatingSupplyKwh, demandKwh: result.values.heatingDemandKwh, coverage: result.values.heatingCoverage })
    expect(cooling.coverage).toBe(result.values.coolingCoverage)
  })

  it("splits revenues and costs into parts that add up to the totals", () => {
    const data = economicsData(result)
    expect(data.revenues.reduce((sum, part) => sum + part.value, 0)).toBeCloseTo(data.revenueTotal, 4)
    expect(data.costs.reduce((sum, part) => sum + part.value, 0)).toBeCloseTo(data.costTotal, 4)
  })

  it("splits the investment into heat pumps, network and supply, largest first", () => {
    const parts = investmentParts(result)
    expect(parts.reduce((sum, part) => sum + part.value, 0)).toBeCloseTo(result.values.overallInvestment, 4)
    expect(parts.map((part) => part.value)).toEqual([...parts.map((part) => part.value)].sort((a, b) => b - a))
  })

  it("sums the 25 cells into 5 types whose totals are the demands", () => {
    const demand = demandByType(result)
    expect(demand.heating).toHaveLength(5)
    expect(demand.heating.reduce((sum, row) => sum + row.total, 0)).toBeCloseTo(result.cells.reduce((sum, cell) => sum + cell.heatingDemandKwh, 0), 3)
    expect(demand.cooling.reduce((sum, row) => sum + row.total, 0)).toBeCloseTo(result.cells.reduce((sum, cell) => sum + cell.coolingDemandKwh, 0), 3)
  })

  it("lists each selected source once, with the two demands", () => {
    const supply = supplyBySource(result)
    expect(supply.rows.map((row) => row.source)).toEqual(result.sources.map((source) => source.source))
    expect(supply.heatingDemandKwh).toBe(result.values.heatingDemandKwh)
    expect(supply.rows.reduce((sum, row) => sum + row.heatingKwh, 0)).toBeCloseTo(result.values.heatingSupplyKwh, 3)
  })

  it("gives the cost shares of the annual costs and the investment per source", () => {
    const costs = costStructure(result)
    expect(costs.annual.reduce((sum, part) => sum + part.share, 0)).toBeCloseTo(1, 6)
    expect(costs.investment.reduce((sum, item) => sum + item.value, 0)).toBeCloseTo(result.values.overallInvestment, 4)
    expect(costs.perSource.reduce((sum, item) => sum + item.electricity, 0)).toBeCloseTo(result.values.electricityCosts, 4)
  })
})

describe("demandByType", () => {
  it("keeps the period split of a type", () => {
    const result = example("school-kindergarten-flats")
    const residential = demandByType(result).heating.find((row) => row.type === "residential")!
    expect(Object.keys(residential.periods)).toEqual(["until_1919", "1919_1960", "1961_1990", "1991_2010", "2011_today"])
    expect(Object.values(residential.periods).reduce((sum, value) => sum + value, 0)).toBeCloseTo(residential.total, 6)
  })
})

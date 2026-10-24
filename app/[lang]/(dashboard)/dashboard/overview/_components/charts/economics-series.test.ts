import { describe, expect, it } from "vitest"
import { ECONOMICS_SERIES } from "./economics-series"

describe("ECONOMICS_SERIES", () => {
  it("has three revenue and three cost parts, the third of each hatched", () => {
    const revenues = ECONOMICS_SERIES.filter((series) => series.group === "revenues")
    const costs = ECONOMICS_SERIES.filter((series) => series.group === "costs")
    expect(revenues.map((series) => series.hatched)).toEqual([false, false, true])
    expect(costs.map((series) => series.hatched)).toEqual([false, false, true])
  })

  it("keeps revenues cyan and costs orange (money in / money out)", () => {
    expect(ECONOMICS_SERIES.filter((series) => series.group === "revenues" && !series.hatched).map((series) => series.color)).toEqual(["var(--chart-1)", "var(--chart-3)"])
    expect(ECONOMICS_SERIES.filter((series) => series.group === "costs" && !series.hatched).map((series) => series.color)).toEqual(["var(--chart-2)", "var(--chart-4)"])
  })
})

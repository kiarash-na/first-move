import { describe, expect, it } from "vitest"
import { barChartHeight, BAR_SIZE, niceMax } from "./chart-style"

describe("chart style", () => {
  it("keeps bars within the 24px mark spec", () => {
    expect(BAR_SIZE).toBeLessThanOrEqual(24)
  })

  it("sizes a bar chart to its rows plus the axis band", () => {
    expect(barChartHeight(3)).toBe(196)
    expect(barChartHeight(1, 60)).toBe(100)
  })

  it("rounds an axis end up to a round number", () => {
    expect(niceMax(423_900)).toBe(600_000)
    expect(niceMax(187_500)).toBe(200_000)
    expect(niceMax(29_279)).toBe(40_000)
    expect(niceMax(200_000)).toBe(200_000)
    expect(niceMax(0.9)).toBe(1)
    expect(niceMax(0)).toBe(1)
    expect(niceMax(Number.NaN)).toBe(1)
  })
})

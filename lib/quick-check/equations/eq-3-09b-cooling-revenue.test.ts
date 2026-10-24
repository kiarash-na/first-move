// @vitest-environment node
import { describe, expect, it } from "vitest"
import { coolingRevenue } from "./eq-3-09b-cooling-revenue"

describe("EQ-3.9b cooling revenue", () => {
  it("adds the base-price term over all cells and the energy-price term", () => {
    // base: 2 · 500 · 3 + 1 · 1 000 · 3 = 3 000 + 3 000 = 6 000 €/a
    // energy: 10 000 kWh/a · 0.08 €/kWh = 800 €/a → total 6 800 €/a
    const cells = [
      { buildings: 2, floorAreaM2: 500 },
      { buildings: 1, floorAreaM2: 1_000 },
    ]
    expect(coolingRevenue(cells, 3, 10_000, 0.08)).toEqual({ base: 6_000, energy: 800, total: 6_800 })
  })
})

// @vitest-environment node
import { describe, expect, it } from "vitest"
import { heatingRevenue } from "./eq-3-09a-heating-revenue"

const cells = [
  { buildings: 2, floorAreaM2: 500 },
  { buildings: 1, floorAreaM2: 1_000 },
]

describe("EQ-3.9a heating revenue", () => {
  it("adds the base-price term over all cells and the energy-price term", () => {
    // base: 2 · 500 · 6 + 1 · 1 000 · 6 = 6 000 + 6 000 = 12 000 €/a
    // energy: 100 000 kWh/a · 0.12 €/kWh = 12 000 €/a → total 24 000 €/a
    expect(heatingRevenue(cells, 6, 100_000, 0.12)).toEqual({ base: 12_000, energy: 12_000, total: 24_000 })
  })

  it("has no base revenue from cells without floor area (industry, OQ-02)", () => {
    // 3 · 0 · 6 = 0; energy 1 000 · 0.12 = 120
    expect(heatingRevenue([{ buildings: 3, floorAreaM2: 0 }], 6, 1_000, 0.12).total).toBeCloseTo(120, 9)
  })
})

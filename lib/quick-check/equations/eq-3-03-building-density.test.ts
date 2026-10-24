// @vitest-environment node
import { describe, expect, it } from "vitest"
import { buildingDensity } from "./eq-3-03-building-density"

describe("EQ-3.3 building density", () => {
  it("gives buildings per hectare", () => {
    // 30 · 10⁴ / 10 000 m² = 30 buildings/ha
    expect(buildingDensity(30, 10_000)).toBe(30)
    // 5 · 10⁴ / 4 000 m² = 12.5 buildings/ha
    expect(buildingDensity(5, 4_000)).toBe(12.5)
  })

  it("is null for an area of 0", () => {
    expect(buildingDensity(5, 0)).toBeNull()
  })
})

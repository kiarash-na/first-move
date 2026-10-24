// @vitest-environment node
import { describe, expect, it } from "vitest"
import { heatDensity } from "./eq-3-05-heat-density"

describe("EQ-3.5 heat density", () => {
  it("divides the heating demand by the network length", () => {
    // 600 000 kWh/a / 300 m = 2 000 kWh/m (= 2 MWh/m, OQ-10)
    expect(heatDensity(600_000, 300)).toBe(2_000)
    expect(heatDensity(0, 300)).toBe(0)
  })

  it("is null for a length of 0", () => {
    expect(heatDensity(600_000, 0)).toBeNull()
  })
})

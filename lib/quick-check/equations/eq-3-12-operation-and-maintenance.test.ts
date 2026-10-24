// @vitest-environment node
import { describe, expect, it } from "vitest"
import { operationAndMaintenance } from "./eq-3-12-operation-and-maintenance"

describe("EQ-3.12 operation and maintenance", () => {
  it("is 2 % of the overall investment", () => {
    // 0.02 · 325 000 € = 6 500 €/a
    expect(operationAndMaintenance(325_000)).toBe(6_500)
  })
})

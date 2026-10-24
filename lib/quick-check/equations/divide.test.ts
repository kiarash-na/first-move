// @vitest-environment node
import { describe, expect, it } from "vitest"
import { divide } from "./divide"

describe("divide", () => {
  it("divides", () => {
    expect(divide(6, 4)).toBe(1.5)
    expect(divide(0, 5)).toBe(0)
  })

  it("is null for a zero denominator or a non-finite quotient", () => {
    expect(divide(1, 0)).toBeNull()
    expect(divide(0, 0)).toBeNull()
    expect(divide(Number.MAX_VALUE, Number.MIN_VALUE)).toBeNull()
  })
})

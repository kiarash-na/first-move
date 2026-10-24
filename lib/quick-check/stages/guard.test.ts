// @vitest-environment node
import { describe, expect, it } from "vitest"
import { createGuard } from "./guard"

describe("createGuard", () => {
  it("passes values through", () => {
    const guard = createGuard()
    expect(guard.need(4.5, "a")).toBe(4.5)
    expect(guard.need(0, "a")).toBe(0)
    expect(guard.invalid).toEqual([])
  })

  it("records each field whose value is null once", () => {
    const guard = createGuard()
    expect(guard.need(null, "a")).toBe(0)
    guard.need(null, "a")
    guard.need(null, "b")
    expect(guard.invalid).toEqual(["a", "b"])
  })
})

// @vitest-environment node
import { describe, expect, it } from "vitest"
import { bounds, fieldText, trace } from "./define"

describe("registry helpers", () => {
  it("fills trace metadata with empty lists", () => {
    expect(trace({ feeds: ["EQ-3.1"] })).toEqual({
      requirements: [],
      openQuestions: [],
      decisions: [],
      feeds: ["EQ-3.1"],
      replaces: [],
      tables: [],
    })
  })

  it("points a field at its dictionary node", () => {
    expect(fieldText("quick-check", "buildings.total")).toEqual({ area: "quick-check", key: "fields.buildings.total" })
  })

  it("copies only the bounds a limit sets", () => {
    expect(bounds({ min: 1, max: 5, integer: true })).toEqual({ min: 1, max: 5 })
    expect(bounds({ exclusiveMin: 0, max: 5 })).toEqual({ exclusiveMin: 0, max: 5 })
  })
})

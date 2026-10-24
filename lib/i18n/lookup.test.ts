import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { lookup } from "./lookup"

describe("lookup", () => {
  it("reads a nested string", () => {
    expect(lookup(quickCheck, "fields.buildings.total.label")).toBe(quickCheck.fields.buildings.total.label)
  })

  it("returns null for a missing path, a node that is not a string, or an empty string", () => {
    expect(lookup(quickCheck, "fields.nothing.label")).toBeNull()
    expect(lookup(quickCheck, "fields.buildings")).toBeNull()
    expect(lookup({ a: "" }, "a")).toBeNull()
    expect(lookup(null, "a")).toBeNull()
  })

  it("ignores inherited keys", () => {
    expect(lookup({}, "constructor")).toBeNull()
  })
})

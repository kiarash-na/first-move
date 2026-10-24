// @vitest-environment node
import { describe, expect, it } from "vitest"
import { createListItem } from "./create-list-item"
import { riskSchema } from "./schema/business-plan"

describe("createListItem", () => {
  it("builds an empty, valid row with the given id", () => {
    const row = createListItem("businessPlan.risks", "risk-1")
    expect(row).toEqual({ id: "risk-1", title: "", description: "", dealBreaker: false, validation: "" })
    expect(riskSchema.safeParse(row).success).toBe(true)
  })

  it("generates a fresh id by default", () => {
    const a = createListItem("businessPlan.allocation")
    const b = createListItem("businessPlan.allocation")
    expect(a.id).not.toBe(b.id)
    expect(Object.keys(a)).toEqual(["id", "stakeholder", "investment", "risk", "benefit"])
  })

  it("throws for anything but an item list", () => {
    expect(() => createListItem("site.stakeholders")).toThrow(/not an item list/)
    expect(() => createListItem("businessPlan.nope")).toThrow()
  })
})

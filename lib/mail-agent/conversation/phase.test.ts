// @vitest-environment node
import { describe, expect, it } from "vitest"
import { createProject } from "@/lib/project"
import { run } from "@/lib/quick-check"
import { isQuickCheckKey, missingQuestions, stepOf } from "./phase"

describe("phase helpers", () => {
  it("finds the Business Plan step of a field, lists included", () => {
    expect(stepOf("site.name")).toBe("opportunity")
    expect(stepOf("businessPlan.canvas.channels")).toBe("business-logic")
    expect(stepOf("businessPlan.risks")).toBe("reality-check")
    expect(stepOf("businessPlan.nextSteps.pilots")).toBe("implementation")
    expect(stepOf("buildings.total")).toBeNull()
  })

  it("tells Quick Check fields apart", () => {
    expect(isQuickCheckKey("buildings.shares.residential.until_1919")).toBe(true)
    expect(isQuickCheckKey("meta.name")).toBe(true)
    expect(isQuickCheckKey("site.name")).toBe(false)
  })

  it("asks for what the engine misses, in the list's order", () => {
    const result = run(createProject({ modules: { quickCheck: true }, now: new Date(Date.UTC(2026, 9, 25)) }))
    if (result.status !== "incomplete") throw new Error("expected an incomplete run")
    expect(missingQuestions(result)).toEqual(["buildings", "area", "mix", "sources"])
    expect(missingQuestions({ ...result, missing: ["sources.potentials"] })).toEqual(["sources"])
    expect(missingQuestions({ ...result, missing: [] })).toEqual(["buildings", "area", "mix", "sources"])
  })
})

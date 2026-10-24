// @vitest-environment node
import { describe, expect, it } from "vitest"
import { stepEquations } from "./step-equations"

describe("stepEquations (D-33)", () => {
  it("lists what each Quick Check step's inputs feed, in methodology order", () => {
    expect(stepEquations("quickCheck", "area")).toEqual(["EQ-3.1", "EQ-3.3", "EQ-3.4b", "EQ-3.9c", "EQ-3.10d"])
    expect(stepEquations("quickCheck", "buildings")).toEqual(["EQ-3.1"])
    expect(stepEquations("quickCheck", "sources")).toEqual(["EQ-3.8a", "EQ-3.8b", "EQ-3.10b", "EQ-3.11"])
  })

  it("includes the estimates a manual value replaces", () => {
    const options = stepEquations("quickCheck", "options")
    expect(options).toEqual(expect.arrayContaining(["EQ-3.2c", "EQ-3.2d", "EQ-3.4a", "EQ-3.4b", "EQ-3.11"]))
    expect(options.indexOf("EQ-3.2c")).toBeLessThan(options.indexOf("EQ-3.11"))
  })

  it("is empty for the qualitative Business Plan (D-27)", () => {
    expect(stepEquations("businessPlan", "opportunity")).toEqual([])
  })
})

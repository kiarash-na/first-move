import { describe, expect, it } from "vitest"
import { aiScoreStatus } from "@/lib/business-plan"
import { aiScoreSchema } from "@/lib/project"
import { CAPPED, report, scored, suggestions, VARIED, withText } from "./fixtures"

describe("result fixtures", () => {
  it("are scored by the engine and pass the schema", async () => {
    const { project, score } = await scored(VARIED)
    expect(aiScoreSchema.parse(score)).toEqual(score)
    expect(aiScoreStatus(project).state).toBe("current")
    expect(score.judgements.find((entry) => entry.id === "financing")?.source).toBe("refused")
    expect(score.gates.find((gate) => gate.id === "operator")).toMatchObject({ outcome: "fail", cap: 3 })
    expect(score.gates.find((gate) => gate.id === "extra-value")?.outcome).toBe("unclear")
    expect(score.capped).toBe(false)
    expect(score.quickCheck).not.toBeNull()
  })

  it("has a capped variant", async () => {
    const { score } = await scored(CAPPED)
    expect(score.capped).toBe(true)
    expect(score.dimensions.find((dimension) => dimension.id === "governance")?.cap).toBe(2)
  })

  it("adds a report and suggestions that pass the schema", async () => {
    const { score } = await scored()
    const full = withText(score, { report: report("de"), suggestions: suggestions(), textTokens: 1500 })
    expect(aiScoreSchema.parse(full)).toEqual(full)
    expect(full.usage.textTokens).toBe(1500)
  })
})

// @vitest-environment node
import { describe, expect, it } from "vitest"
import { labelOf } from "@/lib/ai/plan-score/aggregate"
import { DIMENSIONS } from "@/lib/ai/plan-score/dimensions"
import { BRANCHES } from "@/lib/ai/plan-score/branches"
import { GATES } from "@/lib/ai/plan-score/gates"
import { JUDGEMENTS, TURNS } from "@/lib/ai/plan-score/judgements"
import { DECISION_MODEL_ID, METHOD_VERSION } from "@/lib/ai/plan-score/run"
import { LEVEL_COUNT } from "@/lib/ai/plan-score/scale"
import { displayScore } from "@/lib/business-plan"
import recorded from "./result.json"
import { blindSummary } from "./summary"

describe("blind test summary (slide 5)", () => {
  it("was recorded with a comparable engine: same major method, model and counts, and the label the current rule gives", () => {
    // Method 1.1.0 (D-81) only moved the label onto the shown score: the recorded decisions and
    // numbers stay comparable, and the recorded label must still be the one the rule gives now.
    const major = (version: string) => version.split(".")[0]
    expect(major(recorded.method)).toBe(major(METHOD_VERSION))
    expect(labelOf(displayScore(recorded.score.value, recorded.score.sd).score, recorded.score.capped)).toBe(recorded.score.level)
    expect(recorded.models.decision).toBe(DECISION_MODEL_ID)
    expect(recorded.engine).toEqual({
      judgements: JUDGEMENTS.length,
      turns: TURNS.length,
      gates: GATES.length,
      branches: BRANCHES.length,
      dimensions: DIMENSIONS.length,
      levels: LEVEL_COUNT,
    })
    expect(recorded.errors).toEqual([])
  })

  it("shows the score as the app rounds it, and the facts the slide states", () => {
    const summary = blindSummary("en")
    expect(summary.score).toBe(displayScore(recorded.score.value, recorded.score.sd).score)
    expect(summary.dimensions.map((dimension) => dimension.id)).toEqual(DIMENSIONS.map((dimension) => dimension.id))
    expect(summary.gates.pass + summary.gates.fail + summary.gates.unclear).toBe(recorded.gates.length)
    expect(summary.capped).toBe(summary.mustHaveFailed.length > 0)
    expect(summary.decisionsMs).toBeLessThan(60_000)
    expect(summary.input.created < recorded.at).toBe(true)
  })

  it("takes the suggestion in the slide's language", () => {
    expect(blindSummary("en").action).toBe(recorded.report.en.actions[0])
    expect(blindSummary("de").action).toBe(recorded.report.de.actions[0])
  })
})

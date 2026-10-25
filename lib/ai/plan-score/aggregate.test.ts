import { describe, expect, it } from "vitest"
import { aggregate, displayScore, labelOf } from "./aggregate"
import { DIMENSIONS } from "./dimensions"
import type { FlowNode, GateNode, JudgementNode } from "./nodes"

const judgement = (id: string, dimension: JudgementNode["dimension"], probabilities: number[] | null, source: JudgementNode["source"] = "model"): JudgementNode => ({
  kind: "judgement",
  id,
  fields: [id],
  turn: 1,
  dimension,
  source,
  level: source === "empty" ? 0 : probabilities ? probabilities.reduce((sum, p, level) => sum + p * level, 0) : null,
  probabilities,
  hash: "00000000",
})
const gate = (id: string, dimension: GateNode["dimension"], outcome: GateNode["outcome"], cap: GateNode["cap"]): GateNode => ({
  kind: "gate",
  id,
  turn: 1,
  dimension,
  branch: null,
  source: "model",
  probability: outcome === "pass" ? 0.9 : outcome === "fail" ? 0.1 : 0.5,
  outcome,
  cap,
})
/** One judgement per dimension, all with the same distribution. */
const everywhere = (probabilities: number[]): FlowNode[] => DIMENSIONS.map(({ id }) => judgement(id, id, probabilities))
const dimension = (nodes: FlowNode[], id: string) => aggregate(nodes).dimensions.find((entry) => entry.id === id)!

describe("aggregate (PLAN-AI-SCORE-01 § Aggregation)", () => {
  it("is 100 for a certain level 4 everywhere and 0 for empty judgements", () => {
    expect(aggregate(everywhere([0, 0, 0, 0, 1]))).toMatchObject({ score: 100, sd: 0, level: "solid", capped: false })
    expect(aggregate(DIMENSIONS.map(({ id }) => judgement(id, id, null, "empty")))).toMatchObject({ score: 0, sd: 0, level: "early" })
  })

  it("turns the spread of Jev's distribution into a band", () => {
    expect(aggregate(everywhere([0, 0, 1, 0, 0]))).toMatchObject({ score: 50, sd: 0 })
    const unsure = aggregate(everywhere([0, 0.5, 0, 0.5, 0]))
    expect(unsure.score).toBe(50)
    // Each dimension: SD 1 level = 0.25; total = 100 × √(Σ (w × 0.25)²).
    const expected = 100 * Math.sqrt(DIMENSIONS.reduce((sum, { weight }) => sum + (weight * 0.25) ** 2, 0))
    expect(unsure.sd).toBeCloseTo(expected, 1)
  })

  it("averages judgements within a dimension and skips refused ones", () => {
    const nodes: FlowNode[] = [judgement("a", "governance", [0, 0, 0, 0, 1]), judgement("b", "governance", [0, 0, 1, 0, 0]), judgement("r", "governance", null, "refused")]
    expect(dimension(nodes, "governance")).toMatchObject({ items: 2, raw: 0.75, score: 0.75, cap: null })
  })

  it("lets a failed gate cap its dimension, while unclear gates and flags never do", () => {
    const strong = everywhere([0, 0, 0, 0, 1])
    expect(dimension([...strong, gate("boundary", "governance", "fail", 2)], "governance")).toMatchObject({ raw: 1, score: 0.5, cap: 2 })
    expect(dimension([...strong, gate("operator", "governance", "fail", 3), gate("boundary", "governance", "fail", 2)], "governance").cap).toBe(2)
    expect(dimension([...strong, gate("boundary", "governance", "unclear", 2)], "governance")).toMatchObject({ score: 1, cap: null })
    expect(dimension([...strong, gate("extra-value", "value", "fail", null)], "value")).toMatchObject({ score: 1, cap: null })
    // A cap never raises a weak dimension.
    expect(dimension([...everywhere([0, 1, 0, 0, 0]), gate("operator", "governance", "fail", 3)], "governance").score).toBe(0.25)
  })

  it("keeps a plan with a failed must-have gate below Solid", () => {
    const result = aggregate([...everywhere([0, 0, 0, 0, 1]), gate("deal-breaker", "evidence", "fail", 2)])
    expect(result.score).toBe(95)
    expect(result).toMatchObject({ level: "promising", capped: true })
    expect(aggregate([...everywhere([0, 0, 0, 0, 1]), gate("start-small", "path", "fail", 3)])).toMatchObject({ level: "solid", capped: false })
  })

  it("names three broad labels and rounds for display", () => {
    expect([0, 39.9, 40, 69.9, 70, 100].map((score) => labelOf(score, false))).toEqual(["early", "early", "promising", "promising", "solid", "solid"])
    expect(labelOf(85, true)).toBe("promising")
    expect(displayScore(62.4, 7.6)).toEqual({ score: 60, band: 8 })
    expect(displayScore(63, 0.2)).toEqual({ score: 65, band: 1 })
  })

  it("labels the score as shown, rounded to 5, so the number and the label agree (D-81)", () => {
    // The same level everywhere gives a score of 25 × level.
    const at = (level: number, ...gates: GateNode[]) => aggregate([...DIMENSIONS.map(({ id }): JudgementNode => ({ ...judgement(id, id, null), level })), ...gates])
    const cases = [
      [2.72, 68, 70, "solid"],
      [2.7, 67.5, 70, "solid"],
      [2.696, 67.4, 65, "promising"],
      [1.5, 37.5, 40, "promising"],
      [1.496, 37.4, 35, "early"],
    ] as const
    for (const [level, score, shown, label] of cases) {
      const result = at(level)
      expect(result, `level ${level}`).toMatchObject({ score, level: label })
      expect(displayScore(result.score, result.sd).score).toBe(shown)
      expect(labelOf(shown, false)).toBe(label)
    }
    // A failed must-have still keeps a plan shown as 70 below Solid.
    const capped = at(2.9, gate("deal-breaker", "evidence", "fail", 2))
    expect(displayScore(capped.score, capped.sd).score).toBeGreaterThanOrEqual(70)
    expect(capped).toMatchObject({ level: "promising", capped: true })
  })
})

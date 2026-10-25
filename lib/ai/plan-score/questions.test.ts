import { describe, expect, it } from "vitest"
import { getExample, localizeExample } from "@/lib/examples"
import { JUDGEMENTS } from "./judgements"
import { CONTEXT, turnQuestions } from "./questions"
import { LEVEL_CRITERIA } from "./scale"

const all = new Set(JUDGEMENTS.map((judgement) => judgement.id))
const context = { project: localizeExample(getExample("housing-cooperatives")!, "en"), signal: null }

describe("turn questions (PLAN-AI-SCORE-00)", () => {
  it("asks turn 1: the filled judgements of step 1, its gates and the two branches", () => {
    const { questions, nodes, rules } = turnQuestions(1, all, {}, context)
    expect(Object.values(nodes).filter((node) => node.kind === "judgement")).toHaveLength(JUDGEMENTS.filter((judgement) => judgement.turn === 1).length)
    expect(Object.keys(questions).filter((id) => id.startsWith("b_"))).toEqual(["b_anchor_type", "b_source_type"])
    expect(Object.keys(questions).filter((id) => id.startsWith("g_"))).toEqual(["g_anchor", "g_extra_value", "g_heat_density"])
    expect(rules.map((rule) => [rule.gate.id, rule.outcome])).toEqual([["vienna-zone", "skip"]])
    const score = questions.j_segments
    expect(score).toMatchObject({ type: "score", criteria: LEVEL_CRITERIA })
    expect(String(score.instructions)).toContain(CONTEXT)
    expect(String(score.instructions)).toContain("Customer segments (opportunity); Customer segments (canvas)")
  })

  it("asks only the filled judgements, and choice gates as choices", () => {
    const { questions, nodes } = turnQuestions(3, new Set(["financing"]), {}, context)
    expect(Object.values(nodes).filter((node) => node.kind === "judgement").map((node) => node.kind === "judgement" && node.judgement.id)).toEqual(["financing"])
    expect(questions.g_lifetime_cover).toMatchObject({ type: "choice", criteria: { yes: expect.any(String), partly: expect.any(String), no: expect.any(String) } })
  })

  it("adds the follow-up of the chosen option, and none for an option without one", () => {
    const chosen = turnQuestions(2, all, { "anchor-type": "public", "source-type": "unclear" }, context)
    expect(Object.keys(chosen.questions).filter((id) => id.startsWith("g_"))).toEqual(["g_boundary", "g_operator", "g_cost_key", "g_price_vs_alternative", "g_anchor_public"])
    expect(chosen.nodes.g_anchor_public).toMatchObject({ kind: "gate", branch: "anchor-type" })
    expect(Object.keys(turnQuestions(3, all, { ownership: "unclear" }, context).questions).some((id) => id.startsWith("g_owner"))).toBe(false)
  })
})

import { describe, expect, it } from "vitest"
import { fieldsOf } from "@/lib/project"
import { BRANCHES, FOLLOW_UP_GATE_IDS, followUpGate } from "./branches"
import { DIMENSIONS, DIMENSION_IDS } from "./dimensions"
import { GATES } from "./gates"
import { JUDGEMENTS } from "./judgements"
import { LEVEL_COUNT, LEVEL_CRITERIA } from "./scale"

const STEP_TURN = { opportunity: 1, "business-logic": 2, "reality-check": 3, implementation: 4 } as const

describe("AI Plan Score method (PLAN-AI-SCORE-01)", () => {
  it("reads every Business Plan field exactly once, the scenario choice aside", () => {
    const registry = fieldsOf({ module: "businessPlan" })
      .map((field) => field.id)
      .filter((id) => id !== "businessPlan.scenarioId")
    const read = JUDGEMENTS.flatMap((judgement) => judgement.fields.map((field) => field.id))
    expect([...read].sort()).toEqual([...registry].sort())
    expect(JUDGEMENTS).toHaveLength(27)
  })

  it("judges each judgement in the turn of its first field, in the order of the plan", () => {
    const steps = new Map(fieldsOf({ module: "businessPlan" }).map((field) => [field.id, field.step as keyof typeof STEP_TURN]))
    for (const judgement of JUDGEMENTS) expect(judgement.turn, judgement.id).toBe(STEP_TURN[steps.get(judgement.fields[0].id)!])
    const turns = JUDGEMENTS.map((judgement) => judgement.turn)
    expect(turns).toEqual([...turns].sort())
  })

  it("has weights that sum to 1, and judgements in every dimension", () => {
    expect(DIMENSIONS.reduce((sum, dimension) => sum + dimension.weight, 0)).toBeCloseTo(1, 10)
    for (const id of DIMENSION_IDS) expect(JUDGEMENTS.some((judgement) => judgement.dimension === id), id).toBe(true)
  })

  it("has five ordered levels and a source for every judgement, gate and branch", () => {
    expect(LEVEL_CRITERIA).toHaveLength(LEVEL_COUNT)
    for (const entry of [...JUDGEMENTS, ...GATES, ...BRANCHES]) expect(entry.sources.length, entry.id).toBeGreaterThan(0)
  })

  it("has the 15 gates of the method: 14 plain ones and the water-law permit on the source branch", () => {
    expect(GATES).toHaveLength(14)
    expect(FOLLOW_UP_GATE_IDS).toContain("water-permit")
    const ids = [...GATES.map((gate) => gate.id), ...FOLLOW_UP_GATE_IDS]
    expect(new Set(ids).size).toBe(ids.length)
    expect(GATES.filter((gate) => gate.effect.kind === "cap" && gate.effect.level === 2).map((gate) => gate.id)).toEqual([
      "anchor", "heat-density", "boundary", "price-vs-alternative", "connection-threshold", "lifetime-cover", "subsidy-dependence", "deal-breaker", "decision-gate",
    ])
    for (const gate of GATES.filter((entry) => entry.options)) expect(gate.options!.some((option) => option.verdict === "pass")).toBe(true)
  })

  it("asks a follow-up only in a later turn", () => {
    for (const branch of BRANCHES) {
      expect(branch.followUpTurn).toBeGreaterThan(branch.turn)
      for (const option of branch.options) {
        const gate = followUpGate(branch, option.id)
        if (option.followUp) expect(gate).toMatchObject({ id: option.followUp.id, turn: branch.followUpTurn, dimension: branch.followUpDimension })
        else expect(gate).toBeNull()
      }
    }
  })
})

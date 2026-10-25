import { describe, expect, it } from "vitest"
import { getExample, localizeExample } from "@/lib/examples"
import { applyPatch, createProject } from "@/lib/project"
import { JUDGEMENTS } from "./judgements"
import { buildState, estimateTokens, isJudgementFilled, STATE_TOKEN_BUDGET } from "./state"

const now = new Date("2026-10-24T12:00:00.000Z")
const empty = () => createProject({ modules: { businessPlan: true }, id: "11111111-1111-4111-8111-111111111111", now })

describe("Jev state (PLAN-AI-SCORE-00)", () => {
  it("holds only the filled judgements, merged fields by sub-label, rows without ids or blank cells", () => {
    const project = applyPatch(empty(), {
      "site.name": "Block A",
      "site.currentSupply": ["Natural gas", " "],
      "businessPlan.opportunity.advantage": "Shared groundwater.",
      "businessPlan.risks": [{ id: "r1", title: "Permit", description: " ", dealBreaker: true, validation: "" }],
    }).project
    const state = buildState(project, null, {})
    expect(state.plan).toEqual([
      { key: "site", label: "Site description", value: { Name: "Block A", "Current energy supply": ["Natural gas"] } },
      { key: "advantage", label: "Advantage over the alternatives", value: { "Why a shared low-temperature network": "Shared groundwater." } },
      { key: "risks", label: "Risks and the deal-breaker", value: [{ title: "Permit", dealBreaker: true }] },
    ])
    expect(state.scenario).toBeNull()
    expect(isJudgementFilled(empty(), JUDGEMENTS[0])).toBe(false)
  })

  it("passes the Quick Check signal and earlier decisions through", () => {
    const signal = { level: "promising" as const, buildings: 8, heatDensityMwhPerM: 2, heatingDemandMwh: 900, coolingDemandMwh: 100, heatingCoverage: 1, coolingCoverage: 1, economicRatio: 1.2 }
    expect(buildState(empty(), signal, { q: "a" })).toMatchObject({ quickCheck: signal, decisions: { q: "a" } })
  })

  it("cuts very long plans to the token budget", () => {
    const long = "x".repeat(4_000)
    const texts = JUDGEMENTS.flatMap((judgement) => judgement.fields.map((field) => field.id)).filter((id) => id.startsWith("businessPlan.") && !["businessPlan.allocation", "businessPlan.risks", "businessPlan.criticalAssumptions"].includes(id))
    const project = applyPatch(empty(), Object.fromEntries(texts.map((id) => [id, long]))).project
    expect(estimateTokens(texts.map(() => long))).toBeGreaterThan(STATE_TOKEN_BUDGET)
    expect(estimateTokens(buildState(project, null, {}))).toBeLessThanOrEqual(STATE_TOKEN_BUDGET)
  })

  it("keeps a real example whole", () => {
    const project = localizeExample(getExample("housing-cooperatives")!, "en")
    const state = buildState(project, null, {})
    expect(state.plan).toHaveLength(JUDGEMENTS.length)
    expect(state.scenario).toBe("BM-SCN-03")
    expect(JSON.stringify(state)).not.toContain("…")
  })
})

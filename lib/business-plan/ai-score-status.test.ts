import { describe, expect, it } from "vitest"
import { applyPatch, aiScoreSchema, createProject, type AiScore, type Project } from "@/lib/project"
import { aiScoreStatus, displayScore, fieldValueHash, shortHash } from "./ai-score-status"

const now = new Date("2026-10-24T10:00:00.000Z")

function plan(): Project {
  const empty = createProject({ modules: { businessPlan: true }, id: "11111111-1111-4111-8111-111111111111", now })
  return applyPatch(empty, {
    "businessPlan.opportunity.painPoint": "Gas boilers at the end of their life.",
    "businessPlan.risks": [{ id: "r1", title: "Groundwater permit", description: "May be refused.", dealBreaker: true, validation: "Ask the authority." }],
  }).project
}

function scored(project: Project, groups: string[][]): Project {
  const score: AiScore = aiScoreSchema.parse({
    method: "1.0.0",
    at: now.toISOString(),
    decisionModel: "typesafe-ai/jev-1.14.0",
    score: 50,
    sd: 5,
    level: "promising",
    capped: false,
    dimensions: [],
    judgements: groups.map((fields, index) => ({ id: `j${index}`, fields, hash: fieldValueHash(project, fields), source: "model", level: 2, probabilities: [0, 0, 1, 0, 0] })),
    gates: [],
    branches: [],
    quickCheck: null,
    usage: { decisionTokens: 10, textTokens: 0 },
    report: null,
    suggestions: null,
  })
  return { ...project, aiScore: score }
}

describe("AI Plan Score status (D-73)", () => {
  it("hashes text as 8 hex digits and tells different text apart", () => {
    expect(shortHash("")).toMatch(/^[0-9a-f]{8}$/)
    expect(shortHash("a")).not.toBe(shortHash("b"))
  })

  it("is none without a score", () => {
    expect(aiScoreStatus(plan())).toEqual({ state: "none", score: null, changed: [] })
  })

  it("is current until a scored field changes, then names the judgement", () => {
    const project = scored(plan(), [["businessPlan.opportunity.painPoint"], ["businessPlan.risks"], ["businessPlan.canvas.channels", "businessPlan.canvas.customerRelationships"]])
    expect(aiScoreStatus(project).state).toBe("current")
    const edited = applyPatch(project, { "businessPlan.risks.0.validation": "Drill a test well." }).project
    expect(aiScoreStatus(edited)).toMatchObject({ state: "outdated", changed: ["j1"] })
    const merged = applyPatch(project, { "businessPlan.canvas.customerRelationships": "Ten-year contracts." }).project
    expect(aiScoreStatus(merged)).toMatchObject({ state: "outdated", changed: ["j2"] })
  })

  it("ignores row ids and surrounding blanks", () => {
    const project = scored(plan(), [["businessPlan.risks"], ["businessPlan.opportunity.painPoint"]])
    const rows = project.businessPlan.risks.map((row) => ({ ...row, id: "other" }))
    const same = applyPatch(project, { "businessPlan.risks": rows, "businessPlan.opportunity.painPoint": "  Gas boilers at the end of their life.  " }).project
    expect(aiScoreStatus(same).state).toBe("current")
  })
})

describe("displayScore", () => {
  it("rounds to 5 points and keeps a band of at least 1", () => {
    expect(displayScore(62.4, 7.6)).toEqual({ score: 60, band: 8 })
    expect(displayScore(63, 0.2)).toEqual({ score: 65, band: 1 })
  })
})

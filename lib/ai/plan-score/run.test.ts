import { describe, expect, it } from "vitest"
import { aiScoreStatus } from "@/lib/business-plan"
import { getExample, localizeExample } from "@/lib/examples"
import { applyPatch, createProject, type Project } from "@/lib/project"
import { JUDGEMENTS } from "./judgements"
import type { GateNode } from "./nodes"
import { DECISION_MODEL_ID, METHOD_VERSION, scorePlan, type RunEvent } from "./run"
import { mockJev } from "./test-utils/mock-jev"

const now = () => new Date("2026-10-24T12:00:00.000Z")
const example = (id = "housing-cooperatives"): Project => localizeExample(getExample(id)!, "en")
const all = (levels: number[]) => Object.fromEntries(JUDGEMENTS.map((judgement) => [judgement.id, levels]))

describe("scorePlan (PLAN-AI-SCORE-00)", () => {
  it("runs turn 0 without AI, then one Jev call per step, and returns a valid saved score", async () => {
    const jev = mockJev()
    const events: RunEvent[] = []
    const { score, nodes } = await scorePlan(example(), { decisionModel: jev.model, now, onEvent: (event) => events.push(event) })
    expect(jev.calls).toHaveLength(4)
    expect(events.map((event) => `${event.type}:${event.turn}`)).toEqual([
      "turn-start:0", "turn-end:0", "turn-start:1", "turn-end:1", "turn-start:2", "turn-end:2", "turn-start:3", "turn-end:3", "turn-start:4", "turn-end:4",
    ])
    expect(score).toMatchObject({ method: METHOD_VERSION, at: "2026-10-24T12:00:00.000Z", decisionModel: "jev-test", report: null })
    expect(score.quickCheck).toMatchObject({ level: "further_analysis" })
    expect(score.judgements).toHaveLength(JUDGEMENTS.length)
    expect(score.usage.decisionTokens).toBe(4000)
    expect(nodes.filter((node) => node.kind === "branch").map((node) => node.id)).toEqual(["anchor-type", "source-type", "ownership"])
    expect(aiScoreStatus({ ...example(), aiScore: score }).state).toBe("current")
    expect(DECISION_MODEL_ID).toBe("typesafe-ai/jev-1.14.0")
  })

  it("sends Jev the plan as data and the trusted wording as questions, with zero data retention", async () => {
    const jev = mockJev()
    await scorePlan(example(), { decisionModel: jev.model, now })
    const first = jev.calls[0]
    expect(first.providerOptions).toEqual({ gateway: { zeroDataRetention: true, disallowPromptTraining: true } })
    const state = JSON.stringify(first.state)
    expect(state).toContain("Mixed-ownership housing district")
    expect(state).not.toContain('"id"')
    for (const question of Object.values(first.questions)) expect(JSON.stringify(question)).not.toContain("Mixed-ownership")
  })

  it("asks the follow-up of the chosen option in the next turn, and tells Jev what was decided", async () => {
    const jev = mockJev({ branches: { "anchor-type": "residential", "source-type": "groundwater", ownership: "community" } })
    const { nodes } = await scorePlan(example(), { decisionModel: jev.model, now })
    const followUps = nodes.filter((node): node is GateNode => node.kind === "gate" && node.branch !== null).map((node) => [node.id, node.turn])
    expect(followUps).toEqual([["anchor-residential", 2], ["water-permit", 2], ["owner-community", 3]])
    expect(JSON.stringify(jev.calls[1].state)).toContain("A housing company, a housing cooperative or another large residential owner")
    expect(Object.keys(jev.calls[0].questions).some((id) => id.startsWith("g_owner"))).toBe(false)
  })

  it("decides rule gates without AI and never sends empty judgements", async () => {
    const empty = createProject({ modules: { businessPlan: true }, id: "11111111-1111-4111-8111-111111111111", now: now() })
    const jev = mockJev()
    const { score } = await scorePlan(empty, { decisionModel: jev.model, now })
    expect(score.judgements.every((entry) => entry.source === "empty" && entry.level === 0)).toBe(true)
    for (const call of jev.calls) expect(Object.keys(call.questions).every((id) => !id.startsWith("j_"))).toBe(true)
    const rules = score.gates.filter((gate) => gate.source === "rule").map((gate) => [gate.id, gate.outcome])
    expect(rules).toEqual([["vienna-zone", "skipped"], ["connection-threshold", "fail"], ["deal-breaker", "fail"], ["decision-gate", "fail"]])
    expect(score.quickCheck).toBeNull()
    expect(score.score).toBe(0)
  })

  it("asks the Vienna zone only for a site in Vienna", async () => {
    const vienna = applyPatch(example(), { "site.location": "Wien, 22. Bezirk" }).project
    const jev = mockJev()
    await scorePlan(vienna, { decisionModel: jev.model, now })
    expect(Object.keys(jev.calls[0].questions)).toContain("g_vienna_zone")
  })

  it("records a declined answer as refused and keeps the others", async () => {
    const jev = mockJev({ refuse: ["financing", "operator"] })
    const { score } = await scorePlan(example(), { decisionModel: jev.model, now })
    expect(score.judgements.find((entry) => entry.id === "financing")).toMatchObject({ source: "refused", level: null })
    expect(score.gates.find((gate) => gate.id === "operator")).toMatchObject({ source: "refused", probability: null, outcome: "skipped" })
    expect(score.judgements.find((entry) => entry.id === "subsidies")).toMatchObject({ source: "model", level: 2 })
    // Turns 2 and 3 asked twice: once with everything, once without the declined questions.
    expect(jev.calls).toHaveLength(6)
  })

  it("reads choice gates by their verdicts, and caps the dimension of a failed must-have", async () => {
    const strong = await scorePlan(example(), { decisionModel: mockJev({ levels: all([0, 0, 0, 0.2, 0.8]) }).model, now })
    const weak = await scorePlan(example(), { decisionModel: mockJev({ levels: all([0.2, 0.6, 0.2, 0, 0]) }).model, now })
    expect(strong.score.score).toBeGreaterThan(weak.score.score)
    const boundary = await scorePlan(example(), { decisionModel: mockJev({ levels: all([0, 0, 0, 0, 1]), gates: { boundary: "none" } }).model, now })
    expect(boundary.score.gates.find((gate) => gate.id === "boundary")).toMatchObject({ outcome: "fail", cap: 2 })
    expect(boundary.score.dimensions.find((dimension) => dimension.id === "governance")).toMatchObject({ cap: 2, score: 0.5, raw: 1 })
    expect(boundary.score).toMatchObject({ capped: true, level: "promising" })
  })

  it("caps technology for an ignored heat density only when the Quick Check density is low", async () => {
    const project = example("rural-village-hotel")
    const { score } = await scorePlan(project, { decisionModel: mockJev({ gates: { "heat-density": 0.05 } }).model, now })
    expect(score.quickCheck!.heatDensityMwhPerM).toBeLessThan(0.5)
    expect(score.gates.find((gate) => gate.id === "heat-density")).toMatchObject({ outcome: "fail", cap: 2 })
    const dense = await scorePlan(example(), { decisionModel: mockJev({ gates: { "heat-density": 0.05 } }).model, now })
    expect(dense.score.gates.find((gate) => gate.id === "heat-density")).toMatchObject({ outcome: "fail", cap: null })
  })

  it("throws on a Gateway error and stops when aborted", async () => {
    await expect(scorePlan(example(), { decisionModel: mockJev({ fail: true }).model, now })).rejects.toThrow()
    const controller = new AbortController()
    controller.abort()
    await expect(scorePlan(example(), { decisionModel: mockJev().model, now, abortSignal: controller.signal })).rejects.toThrow()
  })

  it("marks the score outdated once a field of a judgement changes", async () => {
    const project = example()
    const { score } = await scorePlan(project, { decisionModel: mockJev().model, now })
    const edited = applyPatch({ ...project, aiScore: score }, { "businessPlan.assumptions.capex": "About 4 million euros." }).project
    expect(aiScoreStatus(edited)).toMatchObject({ state: "outdated", changed: ["cost-basis"] })
  })
})

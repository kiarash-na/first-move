import { describe, expect, it } from "vitest"
import { scorePlan, type RunEvent } from "@/lib/ai/plan-score/run"
import { JUDGEMENTS } from "@/lib/ai/plan-score/judgements"
import { mockJev } from "@/lib/ai/plan-score/test-utils/mock-jev"
import { createProject } from "@/lib/project"
import { example, NOW, scored } from "../test-utils/scored"
import { followUpOf, gateDefinition, graphFromNodes, graphFromScore, graphNodes, nodeKey } from "./flow-model"

describe("flow model (PLAN-AI-SCORE-00 step 6)", () => {
  it("rebuilds every node of a saved score in the turn that decided it", async () => {
    const score = await scored()
    const graph = graphFromScore(score)
    const nodes = graphNodes(graph)
    expect(nodes.filter((node) => node.kind === "judgement")).toHaveLength(score.judgements.length)
    expect(nodes.filter((node) => node.kind === "gate")).toHaveLength(score.gates.length)
    expect(nodes.filter((node) => node.kind === "branch")).toHaveLength(score.branches.length)
    expect(graph.turns.map((turn) => turn.turn)).toEqual([1, 2, 3, 4])
    expect(graph.turns[0].judgements.map((node) => node.id)).toEqual(JUDGEMENTS.filter((entry) => entry.turn === 1).map((entry) => entry.id))
    expect(graph.signal).toEqual(score.quickCheck)
  })

  it("draws one edge from each branch to the follow-up check it opened in the next turn", async () => {
    const graph = graphFromScore(await scored())
    expect(graph.edges).toEqual([
      { from: "anchor-type", to: "anchor-residential" },
      { from: "source-type", to: "water-permit" },
      { from: "ownership", to: "owner-community" },
    ])
    const turn2 = graph.turns[1]
    expect(turn2.gates.filter((gate) => gate.branch).map((gate) => [gate.id, gate.branch])).toEqual([
      ["anchor-residential", "anchor-type"],
      ["water-permit", "source-type"],
    ])
    expect(graph.turns[0].branches.map((branch) => branch.followUp)).toEqual(["anchor-residential", "water-permit"])
  })

  it("draws no edge for an option without a follow-up", async () => {
    const graph = graphFromScore(await scored(example(), { branches: { "anchor-type": "none", "source-type": "unclear", ownership: "unclear" } }))
    expect(graph.edges).toEqual([])
    expect(graph.turns[0].branches.every((branch) => branch.followUp === null)).toBe(true)
  })

  it("puts empty plan parts into turn 0 and marks the changed ones", async () => {
    const empty = createProject({ modules: { businessPlan: true }, id: "11111111-1111-4111-8111-111111111111", now: NOW() })
    const score = await scored(empty)
    const graph = graphFromScore(score, ["site"])
    expect(graph.empty).toHaveLength(JUDGEMENTS.length)
    expect(graph.turns.every((turn) => turn.judgements.length === 0)).toBe(true)
    expect(graph.empty.find((node) => node.id === "site")?.changed).toBe(true)
    expect(graph.signal).toBeNull()
  })

  it("keeps the applied cap of a failed check and the effect of its definition", async () => {
    const graph = graphFromScore(await scored(example(), { gates: { anchor: 0.05, "extra-value": 0.05 } }))
    const gates = graph.turns[0].gates
    expect(gates.find((gate) => gate.id === "anchor")).toMatchObject({ outcome: "fail", cap: 2, effect: { kind: "cap", level: 2, conditional: false } })
    expect(gates.find((gate) => gate.id === "extra-value")).toMatchObject({ outcome: "fail", cap: null, effect: { kind: "flag" } })
    expect(gates.find((gate) => gate.id === "heat-density")?.effect).toEqual({ kind: "cap", level: 2, conditional: true })
  })

  it("grows live from the nodes each turn emits, and ends equal to the saved graph", async () => {
    const project = example()
    const events: RunEvent[] = []
    const jev = mockJev({ branches: { "anchor-type": "residential" } })
    const { score, nodes } = await scorePlan(project, { decisionModel: jev.model, now: NOW, onEvent: (event) => events.push(event) })
    const turn0 = events.find((event) => event.type === "turn-end" && event.turn === 0)
    expect(graphFromNodes([]).signal).toBeUndefined()
    expect(graphFromNodes(turn0?.type === "turn-end" ? turn0.nodes : []).turns.every((turn) => turn.judgements.length === 0)).toBe(true)
    const live = graphFromNodes(nodes)
    const saved = graphFromScore(score)
    expect(graphNodes(live).map((node) => nodeKey(node.kind, node.id))).toEqual(graphNodes(saved).map((node) => nodeKey(node.kind, node.id)))
    expect(live.edges).toEqual(saved.edges)
    expect(live.turns[1].gates.map((gate) => gate.cap)).toEqual(saved.turns[1].gates.map((gate) => gate.cap))
  })

  it("knows where each check sits and which option opens which follow-up", () => {
    expect(gateDefinition("boundary")).toMatchObject({ turn: 2, dimension: "governance", branch: null })
    expect(gateDefinition("owner-utility")).toMatchObject({ turn: 3, dimension: "governance", branch: "ownership", effect: { kind: "flag" } })
    expect(gateDefinition("water-permit")).toMatchObject({ turn: 2, dimension: "technology", effect: { kind: "cap", level: 2 } })
    expect(gateDefinition("nope")).toBeNull()
    expect(followUpOf("source-type", "borehole")).toBe("water-permit")
    expect(followUpOf("anchor-type", "none")).toBeNull()
    expect(followUpOf("anchor-type", "refused")).toBeNull()
  })
})

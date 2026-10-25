import { appliedCap } from "@/lib/ai/plan-score/aggregate"
import { BRANCHES } from "@/lib/ai/plan-score/branches"
import type { DimensionId } from "@/lib/ai/plan-score/dimensions"
import { GATES } from "@/lib/ai/plan-score/gates"
import { JUDGEMENTS, TURNS, type Turn } from "@/lib/ai/plan-score/judgements"
import type { FlowNode } from "@/lib/ai/plan-score/nodes"
import type { AiGateOutcome, AiScore } from "@/lib/project"
import type { ResultLevel } from "@/lib/quick-check"

/**
 * The decision flow as the graph draws it (PLAN-AI-SCORE-00 step 6), built either live from the
 * nodes a run emits or afterwards from the saved score plus the engine's static definitions
 * (judgements, gates and branches know their turn and dimension; the saved score does not).
 * Pure: no React, no copy.
 */
export interface JudgementView {
  kind: "judgement"
  id: string
  turn: Turn
  dimension: DimensionId
  source: "empty" | "model" | "refused"
  level: number | null
  probabilities: number[] | null
  /** The text changed after the run (`aiScoreStatus`). */
  changed: boolean
}

export type GateEffectView = { kind: "cap"; level: 2 | 3; conditional: boolean } | { kind: "flag" }

export interface GateView {
  kind: "gate"
  id: string
  turn: Turn
  dimension: DimensionId
  /** The branch whose choice asked this follow-up check, or null for a plain check. */
  branch: string | null
  source: "rule" | "model" | "refused"
  probability: number | null
  outcome: AiGateOutcome
  /** The cap this check applied (it failed), or null. */
  cap: number | null
  effect: GateEffectView
}

export interface BranchView {
  kind: "branch"
  id: string
  turn: Turn
  choice: string
  probabilities: Record<string, number>
  /** The follow-up check the chosen option asks in the next turn, when it was asked. */
  followUp: string | null
}

export interface SignalView {
  level: ResultLevel
  heatDensityMwhPerM: number
  economicRatio: number | null
}

export interface TurnView {
  turn: Turn
  judgements: JudgementView[]
  gates: GateView[]
  branches: BranchView[]
}

/** A drawn edge: from a branch to the follow-up check it opened. */
export interface FlowEdge {
  from: string
  to: string
}

export interface FlowGraph {
  /** The Quick Check signal of turn 0: null without a complete result, undefined before turn 0 ended. */
  signal: SignalView | null | undefined
  /** Plan parts without text, decided in turn 0. */
  empty: JudgementView[]
  turns: TurnView[]
  edges: FlowEdge[]
}

export type FlowNodeView = JudgementView | GateView | BranchView

interface GateDefinition {
  turn: Turn
  dimension: DimensionId
  branch: string | null
  effect: GateEffectView
}

/** Where a check sits and what it does: a plain check, or the follow-up of a branch option. */
export function gateDefinition(id: string): GateDefinition | null {
  const gate = GATES.find((entry) => entry.id === id)
  if (gate) {
    const effect: GateEffectView = gate.effect.kind === "cap" ? { kind: "cap", level: gate.effect.level, conditional: Boolean(gate.capWhen) } : { kind: "flag" }
    return { turn: gate.turn, dimension: gate.dimension, branch: null, effect }
  }
  for (const branch of BRANCHES) {
    const followUp = branch.options.find((option) => option.followUp?.id === id)?.followUp
    if (!followUp) continue
    const effect: GateEffectView = followUp.effect.kind === "cap" ? { kind: "cap", level: followUp.effect.level, conditional: false } : { kind: "flag" }
    return { turn: branch.followUpTurn, dimension: branch.followUpDimension, branch: branch.id, effect }
  }
  return null
}

/** The follow-up check id of a branch option, or null (an option such as "none" asks nothing). */
export function followUpOf(branchId: string, choice: string): string | null {
  return BRANCHES.find((branch) => branch.id === branchId)?.options.find((option) => option.id === choice)?.followUp?.id ?? null
}

const JUDGEMENT_ORDER = new Map(JUDGEMENTS.map((judgement, index) => [judgement.id, index]))
const GATE_ORDER = new Map<string, number>([
  ...GATES.map((gate, index) => [gate.id, index] as const),
  ...BRANCHES.flatMap((branch) => branch.options.flatMap((option) => (option.followUp ? [[option.followUp.id, 100] as const] : []))),
])
const BRANCH_ORDER = new Map(BRANCHES.map((branch, index) => [branch.id, index]))
const by = (order: Map<string, number>) => (a: { id: string }, b: { id: string }) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999)

function assemble(signal: FlowGraph["signal"], judgements: JudgementView[], gates: GateView[], branches: BranchView[]): FlowGraph {
  const asked = new Set(gates.map((gate) => gate.id))
  const linked = branches.map((branch) => {
    const followUp = followUpOf(branch.id, branch.choice)
    return { ...branch, followUp: followUp && asked.has(followUp) ? followUp : null }
  })
  const turns = TURNS.map((turn) => ({
    turn,
    judgements: judgements.filter((entry) => entry.turn === turn && entry.source !== "empty").sort(by(JUDGEMENT_ORDER)),
    gates: gates.filter((entry) => entry.turn === turn).sort(by(GATE_ORDER)),
    branches: linked.filter((entry) => entry.turn === turn).sort(by(BRANCH_ORDER)),
  }))
  return {
    signal,
    empty: judgements.filter((entry) => entry.source === "empty").sort(by(JUDGEMENT_ORDER)),
    turns,
    edges: linked.flatMap((branch) => (branch.followUp ? [{ from: branch.id, to: branch.followUp }] : [])),
  }
}

/** The graph of a saved score; `changed` lists the judgements whose text changed since the run. */
export function graphFromScore(score: AiScore, changed: readonly string[] = []): FlowGraph {
  const judgements = score.judgements.flatMap((entry): JudgementView[] => {
    const definition = JUDGEMENTS.find((judgement) => judgement.id === entry.id)
    if (!definition) return []
    return [
      {
        kind: "judgement",
        id: entry.id,
        turn: definition.turn,
        dimension: definition.dimension,
        source: entry.source,
        level: entry.level,
        probabilities: entry.probabilities,
        changed: changed.includes(entry.id),
      },
    ]
  })
  const gates = score.gates.flatMap((entry): GateView[] => {
    const definition = gateDefinition(entry.id)
    if (!definition) return []
    return [{ kind: "gate", id: entry.id, ...definition, source: entry.source, probability: entry.probability, outcome: entry.outcome, cap: entry.cap }]
  })
  const branches = score.branches.flatMap((entry): BranchView[] => {
    const definition = BRANCHES.find((branch) => branch.id === entry.id)
    if (!definition) return []
    return [{ kind: "branch", id: entry.id, turn: definition.turn, choice: entry.choice, probabilities: entry.probabilities, followUp: null }]
  })
  return assemble(score.quickCheck, judgements, gates, branches)
}

/** The graph so far of a running analysis, from the nodes its turns emitted. */
export function graphFromNodes(nodes: readonly FlowNode[]): FlowGraph {
  let signal: FlowGraph["signal"] = undefined
  const judgements: JudgementView[] = []
  const gates: GateView[] = []
  const branches: BranchView[] = []
  for (const node of nodes) {
    switch (node.kind) {
      case "signal":
        signal = node.signal ? { level: node.signal.level, heatDensityMwhPerM: node.signal.heatDensityMwhPerM, economicRatio: node.signal.economicRatio } : null
        break
      case "judgement":
        judgements.push({ kind: "judgement", id: node.id, turn: node.turn, dimension: node.dimension, source: node.source, level: node.level, probabilities: node.probabilities, changed: false })
        break
      case "gate": {
        const effect = gateDefinition(node.id)?.effect ?? { kind: "flag" }
        gates.push({ kind: "gate", id: node.id, turn: node.turn, dimension: node.dimension, branch: node.branch, source: node.source, probability: node.probability, outcome: node.outcome, cap: appliedCap(node), effect })
        break
      }
      case "branch":
        branches.push({ kind: "branch", id: node.id, turn: node.turn, choice: node.choice, probabilities: node.probabilities, followUp: null })
        break
    }
  }
  return assemble(signal, judgements, gates, branches)
}

/** Every node of the graph in reading order: turn 0's empty fields, then each turn. */
export function graphNodes(graph: FlowGraph): FlowNodeView[] {
  return [...graph.empty, ...graph.turns.flatMap((turn) => [...turn.judgements, ...turn.gates, ...turn.branches])]
}

/** The DOM key of a node, used by the edges to find it: `gate:anchor`. */
export const nodeKey = (kind: FlowNodeView["kind"], id: string) => `${kind}:${id}`

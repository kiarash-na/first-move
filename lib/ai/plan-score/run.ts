import type { Experimental_DecisionModel, Experimental_DecisionState } from "ai"
import { fieldValueHash } from "@/lib/business-plan"
import { aiScoreSchema, type AiScore, type Project } from "@/lib/project"
import { aggregate, appliedCap } from "./aggregate"
import { BRANCHES } from "./branches"
import { decideTurn, type DecisionAnswer, type DecisionProviderOptions } from "./decide-turn"
import { expectedLevel, levelProbabilities } from "./distribution"
import { capOf, choicePassProbability, GATE_FAIL, GATE_PASS, type Gate, type GateContext } from "./gates"
import { fieldIdsOf, JUDGEMENTS, TURNS, type Turn } from "./judgements"
import type { BranchNode, FlowNode, GateNode, JudgementNode, SignalNode } from "./nodes"
import { turnQuestions, type QuestionNode } from "./questions"
import { quickCheckSignal } from "./quick-check-signal"
import { MAX_LEVEL } from "./scale"
import { buildState, isJudgementFilled } from "./state"

/**
 * Version of the scoring method (scale, judgements, gates, branches, weights, aggregation).
 * 1.1.0: the label follows the score as shown, rounded to 5 (D-81).
 */
export const METHOD_VERSION = "1.1.0"
/** Jev takes every decision (D-71); pinned so a new release cannot change scores silently. */
export const DECISION_MODEL_ID = "typesafe-ai/jev-1.14.0"

export type RunTurn = 0 | Turn

export type RunEvent =
  | { type: "turn-start"; turn: RunTurn; questions: number }
  | { type: "turn-end"; turn: RunTurn; nodes: FlowNode[]; inputTokens: number }

export interface ScoreOptions {
  /** Jev through the user's key — the Gateway's decision API, or the OpenRouter adapter — or a mock in tests. */
  decisionModel: Exclude<Experimental_DecisionModel, string>
  /** The privacy switches of the decision call's provider; the Gateway's ZDR/no-training options by default. */
  providerOptions?: DecisionProviderOptions
  abortSignal?: AbortSignal
  now?: () => Date
  onEvent?: (event: RunEvent) => void
}

export interface ScoreRun {
  score: AiScore
  nodes: FlowNode[]
}

const round = (value: number, digits = 4) => Math.round(value * 10 ** digits) / 10 ** digits
const clampLevel = (value: number) => Math.min(MAX_LEVEL, Math.max(0, value))

export function gateOutcome(probability: number | null): GateNode["outcome"] {
  if (probability === null) return "skipped"
  return probability >= GATE_PASS ? "pass" : probability <= GATE_FAIL ? "fail" : "unclear"
}

function gateNode(gate: Gate, branch: string | null, turn: Turn, context: GateContext, decided: Pick<GateNode, "source" | "probability" | "outcome">): GateNode {
  return { kind: "gate", id: gate.id, turn, dimension: gate.dimension, branch, cap: capOf(gate, context), ...decided }
}

function toNode(node: QuestionNode, answer: DecisionAnswer | undefined, project: Project, turn: Turn, context: GateContext): FlowNode {
  const refused = !answer || answer.type === "refusal"
  switch (node.kind) {
    case "judgement": {
      const fields = fieldIdsOf(node.judgement)
      const base = { kind: "judgement" as const, id: node.judgement.id, fields, turn, dimension: node.judgement.dimension, hash: fieldValueHash(project, fields) }
      if (refused || answer.type !== "score") return { ...base, source: "refused", level: null, probabilities: null }
      const probabilities = levelProbabilities(answer.probabilities)
      const level = probabilities ? expectedLevel(probabilities) : clampLevel(answer.score)
      return { ...base, source: "model", level: round(level, 3), probabilities: probabilities?.map((p) => round(p)) ?? null }
    }
    case "gate": {
      if (refused) return gateNode(node.gate, node.branch, turn, context, { source: "refused", probability: null, outcome: "skipped" })
      const raw = answer.type === "boolean" ? answer.probability : answer.type === "choice" ? choicePassProbability(node.gate, answer.probabilities ?? { [answer.choice]: 1 }) : null
      const probability = raw === null ? null : round(Math.min(1, Math.max(0, raw)))
      return gateNode(node.gate, node.branch, turn, context, { source: "model", probability, outcome: gateOutcome(probability) })
    }
    case "branch": {
      const options = node.branch.options.map((option) => option.id)
      if (refused || answer.type !== "choice" || !options.includes(answer.choice)) {
        return { kind: "branch", id: node.branch.id, turn, choice: "refused", probabilities: {} }
      }
      const probabilities = Object.fromEntries(options.map((option) => [option, round(answer.probabilities?.[option] ?? (option === answer.choice ? 1 : 0))]))
      return { kind: "branch", id: node.branch.id, turn, choice: answer.choice, probabilities }
    }
  }
}

/** The decisions earlier turns took, as Jev reads them in later turns. */
function decisionsForState(choices: Readonly<Record<string, string>>): Record<string, string> {
  return Object.fromEntries(
    BRANCHES.flatMap((branch) => {
      const option = branch.options.find((entry) => entry.id === choices[branch.id])
      return option ? [[branch.question, option.criterion]] : []
    }),
  )
}

/**
 * Scores the open project's Business Plan (PLAN-AI-SCORE-00): turn 0 without AI, then one Jev
 * call per step from the first field to the last, each building on the branches chosen before;
 * then the aggregation. Throws on a Gateway or network error (the route maps it to copy);
 * nothing is saved here.
 */
export async function scorePlan(project: Project, options: ScoreOptions): Promise<ScoreRun> {
  const now = options.now ?? (() => new Date())
  const emit = options.onEvent ?? (() => {})
  const signal = quickCheckSignal(project)
  const context: GateContext = { project, signal }
  const filled = new Set(JUDGEMENTS.filter((judgement) => isJudgementFilled(project, judgement)).map((judgement) => judgement.id))

  emit({ type: "turn-start", turn: 0, questions: 0 })
  const empty: JudgementNode[] = JUDGEMENTS.filter((judgement) => !filled.has(judgement.id)).map((judgement) => ({
    kind: "judgement",
    id: judgement.id,
    fields: fieldIdsOf(judgement),
    turn: judgement.turn,
    dimension: judgement.dimension,
    source: "empty",
    level: 0,
    probabilities: null,
    hash: fieldValueHash(project, fieldIdsOf(judgement)),
  }))
  const signalNode: SignalNode = { kind: "signal", id: "quick-check", signal }
  const nodes: FlowNode[] = [signalNode, ...empty]
  emit({ type: "turn-end", turn: 0, nodes: [signalNode, ...empty], inputTokens: 0 })

  const choices: Record<string, string> = {}
  let decisionTokens = 0
  for (const turn of TURNS) {
    options.abortSignal?.throwIfAborted()
    const { questions, nodes: asked, rules } = turnQuestions(turn, filled, choices, context)
    emit({ type: "turn-start", turn, questions: Object.keys(questions).length })
    const state = buildState(project, signal, decisionsForState(choices)) as unknown as Experimental_DecisionState
    const { answers, inputTokens } = await decideTurn(options.decisionModel, state, questions, options.abortSignal, options.providerOptions)
    decisionTokens += inputTokens
    const ruled = rules.map(({ gate, branch, outcome }) =>
      gateNode(gate, branch, turn, context, { source: "rule", probability: null, outcome: outcome === "fail" ? "fail" : "skipped" }),
    )
    const decided = [...Object.entries(asked).map(([id, node]) => toNode(node, answers[id], project, turn, context)), ...ruled]
    for (const node of decided) if (node.kind === "branch" && node.choice !== "refused") choices[node.id] = node.choice
    nodes.push(...decided)
    emit({ type: "turn-end", turn, nodes: decided, inputTokens })
  }

  const result = aggregate(nodes)
  const order = new Map(JUDGEMENTS.map((judgement, index) => [judgement.id, index]))
  const judgements = nodes.filter((node): node is JudgementNode => node.kind === "judgement").sort((a, b) => order.get(a.id)! - order.get(b.id)!)
  const score = aiScoreSchema.parse({
    method: METHOD_VERSION,
    at: now().toISOString(),
    decisionModel: options.decisionModel.modelId,
    score: result.score,
    sd: result.sd,
    level: result.level,
    capped: result.capped,
    dimensions: result.dimensions.map(({ id, weight, score: value, raw, sd, cap }) => ({ id, weight, score: value, raw, sd, cap })),
    judgements: judgements.map(({ id, fields, hash, source, level, probabilities }) => ({ id, fields, hash, source, level, probabilities })),
    gates: nodes
      .filter((node): node is GateNode => node.kind === "gate")
      .map((gate) => ({ id: gate.id, source: gate.source, probability: gate.probability, outcome: gate.outcome, cap: appliedCap(gate) })),
    branches: nodes.filter((node): node is BranchNode => node.kind === "branch").map(({ id, choice, probabilities }) => ({ id, choice, probabilities })),
    quickCheck: signal ? { level: signal.level, heatDensityMwhPerM: round(signal.heatDensityMwhPerM, 3), economicRatio: signal.economicRatio === null ? null : round(signal.economicRatio, 3) } : null,
    usage: { decisionTokens, textTokens: 0 },
    report: null,
    suggestions: null,
  })
  return { score, nodes }
}

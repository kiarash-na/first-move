import type { AiGateOutcome } from "@/lib/project"
import type { DimensionId } from "./dimensions"
import type { Turn } from "./judgements"
import type { QuickCheckSignal } from "./quick-check-signal"

/**
 * What one run decided, node by node; the flow graph of the route draws exactly these. Judgement
 * levels, gate probabilities and branch choices come from Jev; empty judgements, rule gates and
 * the Quick Check signal are decided without AI.
 */
export interface JudgementNode {
  kind: "judgement"
  id: string
  fields: string[]
  turn: Turn
  dimension: DimensionId
  source: "empty" | "model" | "refused"
  /** Expected level 0..4; null when refused. */
  level: number | null
  probabilities: number[] | null
  hash: string
}

export interface GateNode {
  kind: "gate"
  id: string
  turn: Turn
  dimension: DimensionId
  /** The branch whose option asked this follow-up, or null for a plain gate. */
  branch: string | null
  source: "rule" | "model" | "refused"
  probability: number | null
  outcome: AiGateOutcome
  /** The cap this gate applies when it fails, in this run's context; null for a flag. */
  cap: 2 | 3 | null
}

export interface BranchNode {
  kind: "branch"
  id: string
  turn: Turn
  choice: string
  probabilities: Record<string, number>
}

export interface SignalNode {
  kind: "signal"
  id: "quick-check"
  signal: QuickCheckSignal | null
}

export type FlowNode = JudgementNode | GateNode | BranchNode | SignalNode

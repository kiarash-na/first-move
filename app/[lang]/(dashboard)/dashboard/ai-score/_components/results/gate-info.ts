import { BRANCHES } from "@/lib/ai/plan-score/branches"
import type { DimensionId } from "@/lib/ai/plan-score/dimensions"
import { GATES, type GateEffect } from "@/lib/ai/plan-score/gates"
import type { Turn } from "@/lib/ai/plan-score/judgements"
import type { AiScore } from "@/lib/project"

/**
 * What the engine says about a check (gate) id, plain or follow-up (PLAN-AI-SCORE-01 § Gates,
 * § Branches): its turn, dimension and effect, whether its cap depends on the Quick Check, and the
 * branch whose options can ask it.
 */
export interface GateInfo {
  id: string
  turn: Turn
  dimension: DimensionId
  effect: GateEffect
  /** The cap applies only under a condition (`capWhen`, the low heat density). */
  conditional: boolean
  /** The branch whose chosen option asks this follow-up check, or null for a plain check. */
  branch: string | null
}

export function gateInfo(id: string): GateInfo | null {
  const gate = GATES.find((entry) => entry.id === id)
  if (gate) return { id, turn: gate.turn, dimension: gate.dimension, effect: gate.effect, conditional: gate.capWhen !== undefined, branch: null }
  for (const branch of BRANCHES) {
    const option = branch.options.find((entry) => entry.followUp?.id === id)
    if (option?.followUp) {
      return { id, turn: branch.followUpTurn, dimension: branch.followUpDimension, effect: option.followUp.effect, conditional: false, branch: branch.id }
    }
  }
  return null
}

/** The decision of this score that asked a follow-up check: the branch and the option it chose. */
export function openedBy(score: AiScore, id: string): { branch: string; option: string } | null {
  for (const decided of score.branches) {
    const option = BRANCHES.find((branch) => branch.id === decided.id)?.options.find((entry) => entry.id === decided.choice)
    if (option?.followUp?.id === id) return { branch: decided.id, option: decided.choice }
  }
  return null
}

/** The follow-up check an option of a branch asks next, or null. */
export function followUpOf(branchId: string, optionId: string): string | null {
  return BRANCHES.find((branch) => branch.id === branchId)?.options.find((entry) => entry.id === optionId)?.followUp?.id ?? null
}

/** The levels a failed check can cap a dimension at, lowest first (the must-have cap is the lowest). */
export const CAP_LEVELS: readonly number[] = [
  ...new Set(
    [...GATES.map((gate) => gate.effect), ...BRANCHES.flatMap((branch) => branch.options.flatMap((option) => (option.followUp ? [option.followUp.effect] : [])))].flatMap(
      (effect) => (effect.kind === "cap" ? [effect.level] : []),
    ),
  ),
].sort((a, b) => a - b)

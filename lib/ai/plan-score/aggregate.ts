import { displayScore } from "@/lib/business-plan"
import type { AiScoreLevel } from "@/lib/project"
import { DIMENSIONS, type DimensionId } from "./dimensions"
import { expectedLevel, levelVariance } from "./distribution"
import type { FlowNode, GateNode } from "./nodes"
import { MAX_LEVEL } from "./scale"

/**
 * From the decided nodes to the AI Plan Score (PLAN-AI-SCORE-01 § Aggregation), no AI:
 * 1. a judgement counts with its expected level E = Σ k·p(k) (the probability-weighted score of
 *    SRC-GEVAL-2023) and its spread SD; an empty one with 0 and no spread; a refused one not at all;
 * 2. a dimension's level is the mean of its judgements, cut by the lowest cap of its failed gates;
 *    its score is 25 × level (0..100) and its band √(Σ SD²) / n, the judgements taken as
 *    independent (which probably understates it);
 * 3. the AI Plan Score is Σ weight × dimension score, its band √(Σ (weight × band)²);
 * 4. labels: Early < 40 ≤ Promising < 70 ≤ Solid; a must-have cap (level 2) keeps it below Solid.
 *    The label reads the score as stored (one decimal), so the saved score and its label agree.
 * Shown rounded to 5 points, to avoid false precision (QCT-RES-LEVELS).
 */
export const SOLID_FROM = 70
export const PROMISING_FROM = 40

export interface DimensionResult {
  id: DimensionId
  weight: number
  /** Judgements counted. */
  items: number
  /** 0..1 before and after the cap. */
  raw: number
  score: number
  /** One standard deviation, 0..1. */
  sd: number
  cap: number | null
}

export interface Aggregate {
  /** 0..100, one decimal. */
  score: number
  sd: number
  level: AiScoreLevel
  /** A must-have cap is active. */
  capped: boolean
  dimensions: DimensionResult[]
}

const round = (value: number, digits: number) => Math.round(value * 10 ** digits) / 10 ** digits

/** The cap a gate applies: only a failed gate with a cap. */
export const appliedCap = (gate: GateNode) => (gate.outcome === "fail" ? gate.cap : null)

export function labelOf(score: number, mustHaveCap: boolean): AiScoreLevel {
  if (score < PROMISING_FROM) return "early"
  return score >= SOLID_FROM && !mustHaveCap ? "solid" : "promising"
}

/** Rounded for display; core owns it so the Business Plan badge shows the same number. */
export { displayScore }

export function aggregate(nodes: readonly FlowNode[]): Aggregate {
  const gates = nodes.filter((node): node is GateNode => node.kind === "gate")
  const dimensions = DIMENSIONS.map(({ id, weight }): DimensionResult => {
    const judged = nodes.flatMap((node) => {
      if (node.kind !== "judgement" || node.dimension !== id) return []
      if (node.source === "empty") return [{ level: 0, variance: 0 }]
      if (node.probabilities) return [{ level: expectedLevel(node.probabilities), variance: levelVariance(node.probabilities) }]
      return node.level === null ? [] : [{ level: node.level, variance: 0 }]
    })
    const n = judged.length
    const mean = n === 0 ? 0 : judged.reduce((sum, entry) => sum + entry.level, 0) / n
    const sd = n === 0 ? 0 : Math.sqrt(judged.reduce((sum, entry) => sum + entry.variance, 0)) / n
    const caps = gates.filter((gate) => gate.dimension === id).flatMap((gate) => appliedCap(gate) ?? [])
    const cap = caps.length > 0 ? Math.min(...caps) : null
    const level = cap === null ? mean : Math.min(mean, cap)
    return { id, weight, items: n, raw: round(mean / MAX_LEVEL, 4), score: round(level / MAX_LEVEL, 4), sd: round(sd / MAX_LEVEL, 4), cap }
  })
  const score = 100 * dimensions.reduce((sum, dimension) => sum + dimension.weight * dimension.score, 0)
  const sd = 100 * Math.sqrt(dimensions.reduce((sum, dimension) => sum + (dimension.weight * dimension.sd) ** 2, 0))
  const capped = gates.some((gate) => appliedCap(gate) === 2)
  const stored = round(score, 1)
  return { score: stored, sd: round(sd, 1), level: labelOf(stored, capped), capped, dimensions }
}

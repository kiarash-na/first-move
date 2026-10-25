import { aggregate } from "@/lib/ai/plan-score/aggregate"
import type { FlowNode } from "@/lib/ai/plan-score/nodes"
import type { AiDimension, AiScore } from "@/lib/project"

/**
 * What the Aggregate column draws: the seven dimensions and the final score. From a saved score,
 * or, during a run, computed from the decided nodes with the engine's own `aggregate` (no AI) as
 * soon as the four turns are done.
 */
export interface AggregateView {
  score: number
  sd: number
  level: AiScore["level"]
  capped: boolean
  dimensions: Pick<AiDimension, "id" | "weight" | "score" | "raw" | "sd" | "cap">[]
}

export function aggregateOfScore(score: AiScore): AggregateView {
  return { score: score.score, sd: score.sd, level: score.level, capped: score.capped, dimensions: score.dimensions }
}

export function aggregateOfNodes(nodes: readonly FlowNode[]): AggregateView {
  const result = aggregate(nodes)
  return {
    score: result.score,
    sd: result.sd,
    level: result.level,
    capped: result.capped,
    dimensions: result.dimensions.map(({ id, weight, score, raw, sd, cap }) => ({ id, weight, score, raw, sd, cap })),
  }
}

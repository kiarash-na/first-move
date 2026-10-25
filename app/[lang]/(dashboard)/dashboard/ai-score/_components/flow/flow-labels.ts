import type { DimensionId } from "@/lib/ai/plan-score/dimensions"
import type { Dictionary } from "@/lib/i18n/dictionaries"
import type { AiGateOutcome } from "@/lib/project"
import type { FlowNodeView } from "./flow-model"
import { levelId } from "./level-ramp"

/**
 * Names of the engine's ids from the shared `labels` section of `ai-score.json`, so the page never
 * shows an id (`labels.test.ts` checks every id has one). An unknown id falls back to the id.
 */
export type ScoreLabels = Dictionary<"ai-score">["labels"]

type Named = Record<string, { name: string } | string | undefined>

const pick = (entries: Named, id: string): string => {
  const entry = entries[id]
  return typeof entry === "string" ? entry : (entry?.name ?? id)
}

export const judgementName = (labels: ScoreLabels, id: string) => pick(labels.judgements as Named, id)
export const gateName = (labels: ScoreLabels, id: string) => pick(labels.gates as Named, id)
export const branchName = (labels: ScoreLabels, id: string) => pick(labels.branches as Named, id)
export const dimensionName = (labels: ScoreLabels, id: DimensionId | string) => pick(labels.dimensions as Named, id)
export const turnName = (labels: ScoreLabels, turn: number) => labels.turns[String(turn) as keyof ScoreLabels["turns"]] ?? String(turn)
export const outcomeName = (labels: ScoreLabels, outcome: AiGateOutcome) => labels.outcomes[outcome]

/** The level name of an expected level, rounded: "Specific" for 2.4. */
export const levelName = (labels: ScoreLabels, level: number) => labels.levels[levelId(level)].name

export function gateQuestion(labels: ScoreLabels, id: string): string | null {
  return (labels.gates as Record<string, { question?: string } | undefined>)[id]?.question ?? null
}

export function branchQuestion(labels: ScoreLabels, id: string): string | null {
  return (labels.branches as Record<string, { question?: string } | undefined>)[id]?.question ?? null
}

/** The name of a branch option ("Groundwater"), or the id. */
export function optionName(labels: ScoreLabels, branchId: string, optionId: string): string {
  const options = (labels.branches as Record<string, { options?: Record<string, string> } | undefined>)[branchId]?.options
  return options?.[optionId] ?? optionId
}

/** The name of any node of the flow. */
export function nodeName(labels: ScoreLabels, node: FlowNodeView): string {
  if (node.kind === "judgement") return judgementName(labels, node.id)
  if (node.kind === "gate") return gateName(labels, node.id)
  return branchName(labels, node.id)
}

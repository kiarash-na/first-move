import type { Dictionary } from "@/lib/i18n/dictionaries"

/**
 * Names of engine ids from the shared `labels` of `ai-score.json`. The ids are plain strings in a
 * saved score, so a lookup can miss (a score of another method version): it then returns null and
 * the view leaves the entry out instead of showing an id.
 */
export type ScoreLabels = Dictionary<"ai-score">["labels"]

const entry = <T>(map: object, id: string): T | null => (Object.hasOwn(map, id) ? ((map as Record<string, T>)[id] ?? null) : null)

export const judgementName = (labels: ScoreLabels, id: string) => entry<string>(labels.judgements, id)

export const gateCopy = (labels: ScoreLabels, id: string) => entry<{ name: string; question: string }>(labels.gates, id)

export const branchCopy = (labels: ScoreLabels, id: string) => entry<{ name: string; question: string; options: Record<string, string> }>(labels.branches, id)

export const optionName = (labels: ScoreLabels, branchId: string, optionId: string) => {
  const branch = branchCopy(labels, branchId)
  return branch ? entry<string>(branch.options, optionId) : null
}

/** The name of a report or suggestion key: a plan part or a check. */
export const keyName = (labels: ScoreLabels, key: string) => judgementName(labels, key) ?? gateCopy(labels, key)?.name ?? null

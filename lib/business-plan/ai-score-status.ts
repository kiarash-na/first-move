import { getAt, parsePath } from "@/lib/project/path"
import type { AiScore } from "@/lib/project/schema/ai-score"
import type { Project } from "@/lib/project/schema/project"

/**
 * Whether the saved AI Plan Score (D-73) still describes the plan. Each judgement keeps a short
 * hash of the values of the fields it read; a judgement whose hash differs has changed since the
 * run. Pure: the AI layer hashes with the same function when it scores, and core only compares.
 */

/** The value of a field without row ids, so only the content counts. */
function content(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(content)
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => key !== "id")
        .map(([key, inner]) => [key, content(inner)]),
    )
  }
  return typeof value === "string" ? value.trim() : value
}

/** FNV-1a, 32 bit, as 8 hex digits. Not a security hash: it only tells whether text changed. */
export function shortHash(text: string): string {
  let hash = 0x811c9dc5
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, "0")
}

/** The hash of the current values of some fields (registry ids of text, list or row-list fields). */
export function fieldValueHash(project: Project, keys: readonly string[]): string {
  const values = keys.map((key) => {
    const segments = parsePath(key)
    return content(segments ? getAt(project, segments) : undefined) ?? null
  })
  return shortHash(JSON.stringify(values))
}

export type AiScoreState = "none" | "current" | "outdated"

export interface AiScoreStatus {
  state: AiScoreState
  score: AiScore | null
  /** Ids of the judgements whose fields changed since the run. */
  changed: string[]
}

export function aiScoreStatus(project: Project): AiScoreStatus {
  const score = project.aiScore
  if (!score) return { state: "none", score: null, changed: [] }
  const changed = score.judgements.filter((entry) => entry.hash !== fieldValueHash(project, entry.fields)).map((entry) => entry.id)
  return { state: changed.length > 0 ? "outdated" : "current", score, changed }
}

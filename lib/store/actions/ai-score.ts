import { aiScoreSchema, type AiScore } from "@/lib/project"
import type { StoreContext } from "../context"
import { toSummary, upsertSummary } from "../summary"
import { saverFor } from "./saving"

/**
 * Saves the AI Plan Score of the open project (D-73, PLAN-AI-SCORE-00). The section is
 * system-managed like `provenance`: it never goes through `applyPatch`, it is validated here and
 * autosaved like an edit. False when the project is no longer open or the result is invalid,
 * so a run that ends after the user switched projects writes nothing.
 */
export function setAiScore(ctx: StoreContext, projectId: string, score: AiScore | null): boolean {
  const rt = ctx.rt
  const { active } = ctx.get()
  if (!rt || !active || active.meta.id !== projectId) return false
  const parsed = aiScoreSchema.nullable().safeParse(score)
  if (!parsed.success) return false
  const next = { ...active, aiScore: parsed.data, meta: { ...active.meta, updatedAt: ctx.deps.now().toISOString() } }
  ctx.set((state) => ({ active: next, projects: upsertSummary(state.projects, toSummary(next)) }))
  saverFor(ctx, rt, projectId).schedule(next)
  return true
}

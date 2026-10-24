import { applyPatch, type PatchResult, type ProjectPatch } from "@/lib/project"
import { forgetActive, rememberActive } from "../active-ids"
import type { Runtime, StoreContext } from "../context"
import { toSummary, upsertSummary } from "../summary"
import { loadFileLink } from "./file-link"
import { maybeRemind } from "./reminder"
import { persistNow, restingSave, saverFor, settle } from "./saving"

/** Opens a project in this tab (and makes it "last used"). False when it does not exist. */
export async function openProject(ctx: StoreContext, id: string): Promise<boolean> {
  const rt = await ctx.ready()
  const current = ctx.get()
  if (current.activeId === id && current.active) return true
  await settle(rt, id)
  const project = await rt.repo.read(id)
  if (!project) return false
  rt.bases.set(id, project.meta.updatedAt)
  rememberActive(rt.session, rt.local, id)
  ctx.set((state) => ({
    activeId: id,
    active: project,
    lastUsedId: id,
    projects: upsertSummary(state.projects, toSummary(project)),
    save: restingSave(state.mode, project),
  }))
  await loadFileLink(ctx)
  void maybeRemind(ctx, rt, id)
  return true
}

/** Closes the project in this tab. Its pending edits are still saved. */
export async function closeProject(ctx: StoreContext): Promise<void> {
  const rt = await ctx.ready()
  const { activeId } = ctx.get()
  forgetActive(rt.session)
  ctx.set((state) => ({ activeId: null, active: null, save: restingSave(state.mode, null) }))
  if (activeId && !rt.savers.get(activeId)?.pending()) rt.savers.delete(activeId)
  await loadFileLink(ctx)
}

/**
 * Edits the active project through `applyPatch` (D-05) and autosaves it (debounced). Returns the
 * patch result at once, so the UI can show field errors; null when no project is open.
 */
export function patchActive(ctx: StoreContext, patch: ProjectPatch): PatchResult | null {
  const rt = ctx.rt
  const { active } = ctx.get()
  if (!rt || !active) return null
  const result = applyPatch(active, patch, { now: ctx.deps.now() })
  if (result.project !== active) {
    ctx.set((state) => ({ active: result.project, projects: upsertSummary(state.projects, toSummary(result.project)) }))
    saverFor(ctx, rt, active.meta.id).schedule(result.project)
  }
  return result
}

/** Edits any project: the active one through autosave, another one directly (rename from the list). */
export async function patchProject(ctx: StoreContext, id: string, patch: ProjectPatch): Promise<PatchResult | null> {
  const rt = await ctx.ready()
  if (ctx.get().activeId === id) return patchActive(ctx, patch)
  await settle(rt, id)
  const project = await rt.repo.read(id)
  if (!project) return null
  const result = applyPatch(project, patch, { now: ctx.deps.now() })
  if (result.project !== project) {
    rt.bases.set(id, project.meta.updatedAt)
    await persistNow(ctx, rt, result.project, { countsAsEdit: true })
  }
  return result
}

/** Stores every pending edit now; true when all are stored. */
export async function flushAll(rt: Runtime): Promise<boolean> {
  const results = await Promise.all([...rt.savers.values()].map((saver) => saver.flush()))
  return results.every(Boolean)
}

/** Page unload: copies every pending edit synchronously. True when all are kept somewhere. */
export function flushAllSync(rt: Runtime): boolean {
  return [...rt.savers.values()].map((saver) => saver.flushSync()).every(Boolean)
}

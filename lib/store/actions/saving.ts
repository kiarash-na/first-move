import type { Project } from "@/lib/project"
import { HEALTH_CHECK_EVERY_SAVES } from "@/lib/storage/limits"
import type { SaveOptions, SaveOutcome } from "@/lib/storage/repository"
import type { StorageMode } from "@/lib/storage/types"
import { createAutosave, type Autosave, type AutosaveState } from "../autosave"
import type { Runtime, StoreContext } from "../context"
import type { SaveInfo } from "../state"
import { toSummary, upsertSummary } from "../summary"
import { writeLinkedFile } from "./file-link"
import { refreshHealth, requestPersistenceOnce } from "./health"
import { maybeRemind } from "./reminder"

/** Save status of a project that was just opened: "saved" at its last change, unless nothing can be saved. */
export function restingSave(mode: StorageMode | null, project: Project | null): SaveInfo {
  if (mode === "memory") return { state: "error", savedAt: null, error: "unavailable", mirrored: false }
  return { state: project ? "saved" : "idle", savedAt: project?.meta.updatedAt ?? null, error: null, mirrored: false }
}

const STATE_OF: Record<AutosaveState, SaveInfo["state"] | null> = {
  idle: "saved",
  pending: "saving",
  saving: "saving",
  error: "error",
}

function onSaverChange(ctx: StoreContext, rt: Runtime, projectId: string, state: AutosaveState) {
  rt.guard?.setArmed([...rt.savers.values()].some((saver) => saver.pending()))
  if (ctx.get().activeId === projectId) {
    const next = STATE_OF[state]
    if (next) ctx.set((current) => ({ save: { ...current.save, state: next } }))
  } else if (state === "idle") {
    rt.savers.delete(projectId)
  }
}

/** Work after any successful save of a user edit: reminder, linked file, storage checks. */
function afterEdit(ctx: StoreContext, rt: Runtime, project: Project, outcome: Extract<SaveOutcome, { ok: true }>) {
  const id = project.meta.id
  if (outcome.conflict) ctx.notify({ kind: "conflict", projectId: id })
  if (ctx.get().activeId === id && rt.fileHandle) void writeLinkedFile(ctx, project)
  else if (outcome.backup) void maybeRemind(ctx, rt, id, outcome.backup)
  rt.savesSinceHealthCheck++
  if (rt.savesSinceHealthCheck >= HEALTH_CHECK_EVERY_SAVES) {
    rt.savesSinceHealthCheck = 0
    void refreshHealth(ctx)
  }
  void requestPersistenceOnce(ctx)
}

/** Saves a user edit (called by the autosave). */
async function persistEdit(ctx: StoreContext, rt: Runtime, project: Project): Promise<boolean> {
  const id = project.meta.id
  const outcome = await rt.repo.save(project, { base: rt.bases.get(id) ?? null, countsAsEdit: true })
  const active = ctx.get().activeId === id
  if (!outcome.ok) {
    if (active) ctx.set((state) => ({ save: { ...state.save, error: outcome.error, mirrored: outcome.mirrored } }))
    return false
  }
  rt.bases.set(id, project.meta.updatedAt)
  rt.sync.post({ type: "saved", projectId: id, updatedAt: project.meta.updatedAt })
  if (active) {
    const savedAt = ctx.deps.now().toISOString()
    ctx.set((state) => ({ save: { ...state.save, savedAt, error: null, mirrored: outcome.mirrored } }))
  }
  afterEdit(ctx, rt, project, outcome)
  return true
}

/** The autosave of a project, created on first use. */
export function saverFor(ctx: StoreContext, rt: Runtime, projectId: string): Autosave<Project> {
  let saver = rt.savers.get(projectId)
  if (!saver) {
    saver = createAutosave<Project>({
      delayMs: ctx.deps.autosaveDelayMs,
      retryMs: ctx.deps.retryMs,
      timers: ctx.deps.timers,
      save: (project) => persistEdit(ctx, rt, project),
      saveSync: (project) => rt.repo.mirror(project),
      onChange: (state) => onSaverChange(ctx, rt, projectId, state),
    })
    rt.savers.set(projectId, saver)
  }
  return saver
}

/** Waits until a project's pending edits are stored (before reading it back or replacing it). */
export async function settle(rt: Runtime, projectId: string): Promise<void> {
  await rt.savers.get(projectId)?.flush()
}

/**
 * Saves a whole project now (create, copy, restore, import): updates base, list and other tabs.
 * The project stays listed even if the save failed (memory mode), so work can continue.
 */
export async function persistNow(
  ctx: StoreContext,
  rt: Runtime,
  project: Project,
  options: Omit<SaveOptions, "base">,
): Promise<SaveOutcome> {
  const id = project.meta.id
  const outcome = await rt.repo.save(project, { ...options, base: rt.bases.get(id) ?? null })
  if (outcome.ok) {
    rt.bases.set(id, project.meta.updatedAt)
    rt.sync.post({ type: "saved", projectId: id, updatedAt: project.meta.updatedAt })
  }
  ctx.set((state) => ({
    projects: upsertSummary(state.projects, toSummary(project)),
    ...(state.activeId === id && {
      active: project,
      save: outcome.ok ? restingSave(state.mode, project) : { ...state.save, state: "error", error: outcome.error, mirrored: outcome.mirrored },
    }),
  }))
  return outcome
}

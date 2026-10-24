import type { TabMessage } from "@/lib/storage/tab-sync"
import { forgetActive } from "../active-ids"
import type { Runtime, StoreContext } from "../context"
import { removeSummary, toSummary, upsertSummary } from "../summary"
import { loadFileLink } from "./file-link"
import { restingSave } from "./saving"

/**
 * Another tab saved a project (D-11). The open project follows unless this tab has unsaved edits:
 * then this tab's version wins on its next save and the other version is kept as a "conflict"
 * snapshot (by the save itself, which sees the changed base).
 */
async function onSaved(ctx: StoreContext, rt: Runtime, projectId: string, updatedAt: string) {
  const pending = () => rt.savers.get(projectId)?.pending() ?? false
  const before = ctx.get()
  const isActive = before.activeId === projectId
  if (isActive && before.active?.meta.updatedAt === updatedAt) return
  if (isActive && pending()) {
    ctx.notify({ kind: "conflict", projectId })
    return
  }
  const fresh = await rt.repo.read(projectId)
  if (!fresh) return
  const now = ctx.get()
  if (pending()) {
    if (now.activeId === projectId) ctx.notify({ kind: "conflict", projectId })
    return
  }
  rt.bases.set(projectId, fresh.meta.updatedAt)
  if (now.activeId === projectId) {
    if (now.active?.meta.updatedAt === fresh.meta.updatedAt) return
    ctx.set((state) => ({
      active: fresh,
      projects: upsertSummary(state.projects, toSummary(fresh)),
      save: restingSave(state.mode, fresh),
    }))
    ctx.notify({ kind: "changed-elsewhere", projectId })
    return
  }
  ctx.set((state) => ({ projects: upsertSummary(state.projects, toSummary(fresh)) }))
}

/** Another tab deleted a project. Unsaved edits of this tab are kept as a snapshot first. */
async function onDeleted(ctx: StoreContext, rt: Runtime, projectId: string) {
  const saver = rt.savers.get(projectId)
  const unsaved = saver?.pending() ? (saver.latest() ?? null) : null
  saver?.cancel()
  rt.savers.delete(projectId)
  rt.bases.delete(projectId)
  if (unsaved) await rt.repo.addSnapshot(projectId, unsaved, "deleted-elsewhere").catch(() => null)

  const wasActive = ctx.get().activeId === projectId
  if (wasActive) forgetActive(rt.session)
  ctx.set((state) => ({
    projects: removeSummary(state.projects, projectId),
    lastUsedId: state.lastUsedId === projectId ? null : state.lastUsedId,
    ...(state.activeId === projectId && { activeId: null, active: null, save: restingSave(state.mode, null) }),
  }))
  if (wasActive || unsaved) ctx.notify({ kind: "deleted-elsewhere", projectId })
  if (wasActive) await loadFileLink(ctx)
}

export function handleTabMessage(ctx: StoreContext, rt: Runtime, message: TabMessage): Promise<void> {
  return message.type === "saved"
    ? onSaved(ctx, rt, message.projectId, message.updatedAt)
    : onDeleted(ctx, rt, message.projectId)
}

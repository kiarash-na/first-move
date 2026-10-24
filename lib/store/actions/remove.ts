import type { Project } from "@/lib/project"
import { forgetActive, forgetLastUsed } from "../active-ids"
import type { StoreContext } from "../context"
import { touchProject } from "../copy-project"
import { removeNoticesOf } from "../notices"
import { removeSummary } from "../summary"
import { loadFileLink } from "./file-link"
import { addProject } from "./projects"
import { restingSave } from "./saving"

/** What `undoRemove` needs. The project is also kept as a "before-delete" snapshot (PLAN-DASH-04). */
export interface DeleteReceipt {
  projectId: string
  project: Project
  snapshotId: number | null
  wasActive: boolean
}

/** Deletes a project (the UI confirms first, D-02). Pending edits are included in the kept state. */
export async function removeProject(ctx: StoreContext, id: string): Promise<DeleteReceipt | null> {
  const rt = await ctx.ready()
  const { activeId, active } = ctx.get()
  const wasActive = activeId === id
  const saver = rt.savers.get(id)
  const latest = (wasActive ? active : null) ?? (saver?.pending() ? saver.latest() : undefined) ?? (await rt.repo.read(id))
  if (!latest) return null
  saver?.cancel()
  rt.savers.delete(id)

  const snapshotId = await rt.repo.remove(id, latest)
  rt.bases.delete(id)
  forgetLastUsed(rt.local, id)
  if (wasActive) forgetActive(rt.session)
  rt.sync.post({ type: "deleted", projectId: id })
  ctx.set((state) => ({
    projects: removeSummary(state.projects, id),
    notices: removeNoticesOf(state.notices, id),
    lastUsedId: state.lastUsedId === id ? null : state.lastUsedId,
    ...(state.activeId === id && { activeId: null, active: null, save: restingSave(state.mode, null) }),
  }))
  if (wasActive) await loadFileLink(ctx)
  return { projectId: id, project: latest, snapshotId, wasActive }
}

/** Undoes a delete from the toast: the project comes back as it was, reopened if it was open. */
export async function undoRemove(ctx: StoreContext, receipt: DeleteReceipt): Promise<Project> {
  const rt = await ctx.ready()
  return addProject(ctx, rt, touchProject(receipt.project, ctx.deps.now()), { open: receipt.wasActive })
}

/** Removes a project and all its snapshots for good (no undo). */
export async function purgeProject(ctx: StoreContext, id: string): Promise<void> {
  const rt = await ctx.ready()
  if (ctx.get().projects.some((entry) => entry.id === id)) await removeProject(ctx, id)
  await rt.repo.purge(id)
}

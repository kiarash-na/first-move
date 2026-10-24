import type { Project } from "@/lib/project"
import { readStored, type StoredFailure } from "@/lib/storage/read-stored"
import type { SaveErrorCode } from "@/lib/storage/save-error"
import type { SnapshotInfo } from "@/lib/storage/types"
import type { StoreContext } from "../context"
import { touchProject } from "../copy-project"
import { persistNow, settle } from "./saving"

export type RestoreErrorCode = "not-found" | StoredFailure | SaveErrorCode

export type RestoreResult = { ok: true; project: Project } | { ok: false; code: RestoreErrorCode }

/** The snapshots of a project, newest first (restore list in the project menu). */
export async function listSnapshots(ctx: StoreContext, projectId: string): Promise<SnapshotInfo[]> {
  const rt = await ctx.ready()
  try {
    return await rt.repo.listSnapshots(projectId)
  } catch {
    return []
  }
}

/** Deleted projects that can still be brought back, newest first. */
export async function listDeleted(ctx: StoreContext): Promise<SnapshotInfo[]> {
  const rt = await ctx.ready()
  try {
    return await rt.repo.listDeleted()
  } catch {
    return []
  }
}

/**
 * Restores a snapshot (D-11). The current state becomes a "before-restore" snapshot first, so a
 * restore can itself be undone. Old snapshots are migrated. Works for deleted projects too.
 */
export async function restoreSnapshot(ctx: StoreContext, snapshotId: number): Promise<RestoreResult> {
  const rt = await ctx.ready()
  const record = await rt.repo.getSnapshot(snapshotId).catch(() => null)
  if (!record) return { ok: false, code: "not-found" }
  const read = readStored(record.project, record.projectId)
  if (!read.ok) return { ok: false, code: read.code }

  await settle(rt, record.projectId)
  const restored = touchProject(read.project, ctx.deps.now())
  const outcome = await persistNow(ctx, rt, restored, { snapshotReason: "before-restore" })
  if (!outcome.ok) return { ok: false, code: outcome.error }
  return { ok: true, project: restored }
}

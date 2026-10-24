import type { Project } from "@/lib/project"
import type { StorageDb } from "./idb"
import { STORE } from "./keys"
import { MAX_SNAPSHOTS } from "./limits"
import { addSnapshotTo } from "./snapshots"

/**
 * Deletes a project in one transaction but keeps its last state as a "before-delete" snapshot, so
 * the delete can be undone (PLAN-DASH-04 step 3). `latest` is the newest in-memory state (it may
 * not be saved yet); without it the stored record is kept. Returns the snapshot id.
 */
export async function deleteProjectRecord(
  db: StorageDb,
  projectId: string,
  latest: Project | null,
  now: Date,
  maxSnapshots = MAX_SNAPSHOTS,
): Promise<number | null> {
  const tx = db.transaction([STORE.projects, STORE.snapshots, STORE.backups, STORE.fileLinks], "readwrite")
  const done = tx.done
  done.catch(() => undefined)

  const projects = tx.objectStore(STORE.projects)
  const keep = latest ?? (await projects.get(projectId))
  const snapshotId =
    keep === undefined
      ? null
      : await addSnapshotTo(
          tx.objectStore(STORE.snapshots),
          { projectId, takenAt: now.toISOString(), reason: "before-delete", project: keep },
          maxSnapshots,
        )
  await projects.delete(projectId)
  await tx.objectStore(STORE.backups).delete(projectId)
  await tx.objectStore(STORE.fileLinks).delete(projectId)
  await done
  return snapshotId
}

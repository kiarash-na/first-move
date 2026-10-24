import type { StorageDb } from "./idb"
import { STORE } from "./keys"
import { emptyBackup } from "./reminder"
import type { BackupState } from "./types"

/** Export bookkeeping of a project (empty when none is stored). */
export async function readBackup(db: StorageDb, projectId: string): Promise<BackupState> {
  return (await db.get(STORE.backups, projectId)) ?? emptyBackup(projectId)
}

/** Reads, changes and writes the bookkeeping in one transaction. */
export async function updateBackup(
  db: StorageDb,
  projectId: string,
  change: (state: BackupState) => BackupState,
): Promise<BackupState> {
  const tx = db.transaction(STORE.backups, "readwrite")
  const next = change((await tx.store.get(projectId)) ?? emptyBackup(projectId))
  await tx.store.put(next)
  await tx.done
  return next
}

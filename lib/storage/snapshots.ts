import type { IDBPObjectStore, StoreNames } from "idb"
import { nameOf, updatedAtOf, type FirstMoveDb, type StorageDb } from "./idb"
import { STORE } from "./keys"
import { MAX_SNAPSHOTS } from "./limits"
import type { SnapshotInfo, SnapshotRecord } from "./types"

type TxStores = ArrayLike<StoreNames<FirstMoveDb>>

/** The snapshots store inside any read-write transaction that includes it. */
export type SnapshotStore<Tx extends TxStores> = IDBPObjectStore<FirstMoveDb, Tx, typeof STORE.snapshots, "readwrite">

const info = (record: SnapshotRecord): SnapshotInfo => ({
  id: record.id!,
  projectId: record.projectId,
  takenAt: record.takenAt,
  reason: record.reason,
  name: nameOf(record.project),
  updatedAt: updatedAtOf(record.project),
})

/** Deletes the oldest snapshots of a project beyond `max` (D-11: 20 rolling). */
async function prune<Tx extends TxStores>(store: SnapshotStore<Tx>, projectId: string, max: number) {
  const index = store.index("projectId")
  let excess = (await index.count(projectId)) - max
  // Equal index keys are ordered by primary key, so the cursor starts at the oldest.
  let cursor = excess > 0 ? await index.openCursor(projectId) : null
  while (cursor && excess > 0) {
    await cursor.delete()
    excess--
    cursor = await cursor.continue()
  }
}

/** Adds a snapshot inside an open transaction and keeps the newest `max`. Returns its id. */
export async function addSnapshotTo<Tx extends TxStores>(
  store: SnapshotStore<Tx>,
  record: Omit<SnapshotRecord, "id">,
  max = MAX_SNAPSHOTS,
): Promise<number> {
  const id = await store.add(record as SnapshotRecord)
  await prune(store, record.projectId, max)
  return id
}

/** The newest snapshot of a project inside an open transaction. */
export async function newestSnapshotIn<Tx extends TxStores>(
  store: SnapshotStore<Tx>,
  projectId: string,
): Promise<SnapshotRecord | undefined> {
  const cursor = await store.index("projectId").openCursor(projectId, "prev")
  return cursor?.value
}

/** True when the newest snapshot is older than `intervalMs` (or there is none, or the clock went back). */
export function isSnapshotDue(newest: SnapshotRecord | undefined, now: Date, intervalMs: number): boolean {
  if (!newest) return true
  const age = now.getTime() - Date.parse(newest.takenAt)
  return !(age >= 0 && age < intervalMs)
}

/** Adds a snapshot in its own transaction. Returns its id. */
export async function addSnapshot(db: StorageDb, record: Omit<SnapshotRecord, "id">, max = MAX_SNAPSHOTS): Promise<number> {
  const tx = db.transaction(STORE.snapshots, "readwrite")
  const id = await addSnapshotTo(tx.store, record, max)
  await tx.done
  return id
}

/** The snapshots of a project, newest first, without their data. */
export async function listSnapshots(db: StorageDb, projectId: string): Promise<SnapshotInfo[]> {
  const records = await db.getAllFromIndex(STORE.snapshots, "projectId", projectId)
  return records.map(info).sort((a, b) => b.id - a.id)
}

/** One snapshot with its data. */
export async function getSnapshot(db: StorageDb, id: number): Promise<SnapshotRecord | undefined> {
  return db.get(STORE.snapshots, id)
}

/** The snapshots of a project, newest first, with their data (recovery). */
export async function readSnapshots(db: StorageDb, projectId: string): Promise<SnapshotRecord[]> {
  const records = await db.getAllFromIndex(STORE.snapshots, "projectId", projectId)
  return records.sort((a, b) => b.id! - a.id!)
}

/**
 * Deleted projects that can still be restored: projects with snapshots but no record. One entry
 * per project (its newest snapshot), newest first.
 */
export async function listDeletedProjects(db: StorageDb): Promise<SnapshotInfo[]> {
  const tx = db.transaction([STORE.projects, STORE.snapshots])
  const existing = new Set((await tx.objectStore(STORE.projects).getAllKeys()).map(String))
  const newest = new Map<string, SnapshotRecord>()
  let cursor = await tx.objectStore(STORE.snapshots).openCursor(null, "prev")
  while (cursor) {
    const record = cursor.value
    if (!existing.has(record.projectId) && !newest.has(record.projectId)) newest.set(record.projectId, record)
    cursor = await cursor.continue()
  }
  await tx.done
  return [...newest.values()].map(info)
}

/** Removes every snapshot of a project (permanent delete). */
export async function deleteSnapshots(db: StorageDb, projectId: string): Promise<void> {
  const tx = db.transaction(STORE.snapshots, "readwrite")
  let cursor = await tx.store.index("projectId").openCursor(projectId)
  while (cursor) {
    await cursor.delete()
    cursor = await cursor.continue()
  }
  await tx.done
}

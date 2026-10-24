import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import { DB_NAME, DB_VERSION, STORE } from "./keys"
import { DB_OPEN_TIMEOUT_MS } from "./limits"
import type { BackupState, FileLinkRecord, SnapshotRecord } from "./types"

/** The IndexedDB schema (D-11): projects and snapshots, plus export bookkeeping and file links. */
export interface FirstMoveDb extends DBSchema {
  /** Out-of-line keys (`meta.id`), so a damaged record stays addressable. Values are raw JSON. */
  [STORE.projects]: { key: string; value: unknown }
  [STORE.snapshots]: { key: number; value: SnapshotRecord; indexes: { projectId: string } }
  [STORE.backups]: { key: string; value: BackupState }
  [STORE.fileLinks]: { key: string; value: FileLinkRecord }
}

export type StorageDb = IDBPDatabase<FirstMoveDb>

export interface OpenStorageDbOptions {
  name?: string
  timeoutMs?: number
  /** Another tab opened a newer database version; this connection is closed and unusable. */
  onClosed?: () => void
}

/**
 * Opens (and on first use creates) the database. Resolves null when IndexedDB is missing,
 * blocked (some private modes) or does not answer in time; the app then runs on the mirror.
 */
export async function openStorageDb({
  name = DB_NAME,
  timeoutMs = DB_OPEN_TIMEOUT_MS,
  onClosed,
}: OpenStorageDbOptions = {}): Promise<StorageDb | null> {
  if (typeof indexedDB === "undefined") return null
  let db: StorageDb | null = null
  let timedOut = false
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => {
      timedOut = true
      resolve(null)
    }, timeoutMs)
  })
  try {
    const opening = openDB<FirstMoveDb>(name, DB_VERSION, {
      upgrade(database, oldVersion) {
        if (oldVersion < 1) {
          database.createObjectStore(STORE.projects)
          const snapshots = database.createObjectStore(STORE.snapshots, { keyPath: "id", autoIncrement: true })
          snapshots.createIndex("projectId", "projectId")
          database.createObjectStore(STORE.backups, { keyPath: "projectId" })
          database.createObjectStore(STORE.fileLinks, { keyPath: "projectId" })
        }
      },
      blocking() {
        db?.close()
        onClosed?.()
      },
      terminated() {
        onClosed?.()
      },
    }).then((opened) => {
      db = opened
      // Too late: the app already runs on the mirror; do not keep a second writer around.
      if (timedOut) opened.close()
      return opened
    })
    opening.catch(() => undefined)
    return await Promise.race([opening, timeout])
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** All project records, keyed by id. Values are unvalidated JSON. */
export async function readProjectRecords(db: StorageDb): Promise<Map<string, unknown>> {
  const records = new Map<string, unknown>()
  let cursor = await db.transaction(STORE.projects).store.openCursor()
  while (cursor) {
    records.set(String(cursor.key), cursor.value)
    cursor = await cursor.continue()
  }
  return records
}

/** One project record, or undefined. */
export async function readProjectRecord(db: StorageDb, id: string): Promise<unknown> {
  return db.get(STORE.projects, id)
}

/** `meta.updatedAt` of a raw record, or null when it has none. */
export function updatedAtOf(record: unknown): string | null {
  if (typeof record !== "object" || record === null) return null
  const meta = (record as { meta?: unknown }).meta
  if (typeof meta !== "object" || meta === null) return null
  const value = (meta as { updatedAt?: unknown }).updatedAt
  return typeof value === "string" ? value : null
}

/** `meta.name` of a raw record, or null. */
export function nameOf(record: unknown): string | null {
  if (typeof record !== "object" || record === null) return null
  const meta = (record as { meta?: unknown }).meta
  if (typeof meta !== "object" || meta === null) return null
  const value = (meta as { name?: unknown }).name
  return typeof value === "string" ? value : null
}

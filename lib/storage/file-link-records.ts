import type { StorageDb } from "./idb"
import { STORE } from "./keys"
import type { FileLinkRecord } from "./types"

/** Where linked-file handles are kept (IndexedDB; injectable for tests, D-12). */
export interface FileLinkRecords {
  get(projectId: string): Promise<FileLinkRecord | null>
  put(record: FileLinkRecord): Promise<void>
  delete(projectId: string): Promise<void>
}

/** Handles in the `file-links` store; a no-op store when IndexedDB is unavailable. */
export function fileLinkRecords(db: StorageDb | null): FileLinkRecords {
  return {
    async get(projectId) {
      return db ? ((await db.get(STORE.fileLinks, projectId)) ?? null) : null
    },
    async put(record) {
      await db?.put(STORE.fileLinks, record)
    },
    async delete(projectId) {
      await db?.delete(STORE.fileLinks, projectId)
    },
  }
}

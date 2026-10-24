// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { readBackup, updateBackup } from "./backups"
import { deleteProjectRecord } from "./delete-project"
import { openStorageDb, readProjectRecord, type StorageDb } from "./idb"
import { STORE } from "./keys"
import { emptyBackup, recordEdit } from "./reminder"
import { saveProjectRecord } from "./save-project"
import { getSnapshot } from "./snapshots"
import { uniqueDbName } from "./test-utils/db-name"
import { edited, testProject } from "./test-utils/projects"

let db: StorageDb

beforeEach(async () => {
  db = (await openStorageDb({ name: uniqueDbName() }))!
})

afterEach(() => db.close())

const now = new Date("2026-10-24T09:00:00.000Z")

describe("deleteProjectRecord", () => {
  it("removes the project but keeps its newest state as a before-delete snapshot", async () => {
    const stored = testProject(1)
    await saveProjectRecord(db, stored, { base: null, now, countsAsEdit: true })
    await db.put(STORE.fileLinks, { projectId: stored.meta.id, handle: {} as FileSystemFileHandle, fileName: "x", linkedAt: now.toISOString() })
    const unsaved = edited(stored, { "meta.name": "Unsaved" }, "2026-10-24T08:30:00.000Z")

    const snapshotId = await deleteProjectRecord(db, stored.meta.id, unsaved, now)
    expect(await readProjectRecord(db, stored.meta.id)).toBeUndefined()
    expect(await readBackup(db, stored.meta.id)).toEqual(emptyBackup(stored.meta.id))
    expect(await db.get(STORE.fileLinks, stored.meta.id)).toBeUndefined()
    expect(await getSnapshot(db, snapshotId!)).toMatchObject({ reason: "before-delete", project: unsaved })
  })

  it("keeps the stored record when no newer state is given", async () => {
    const stored = testProject(1)
    await saveProjectRecord(db, stored, { base: null, now })
    await updateBackup(db, stored.meta.id, (state) => recordEdit(state, now))
    const snapshotId = await deleteProjectRecord(db, stored.meta.id, null, now)
    expect((await getSnapshot(db, snapshotId!))?.project).toEqual(stored)
  })

  it("does nothing for an unknown project", async () => {
    expect(await deleteProjectRecord(db, "missing", null, now)).toBeNull()
  })
})

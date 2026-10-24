// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { readBackup } from "./backups"
import { openStorageDb, readProjectRecord, type StorageDb } from "./idb"
import { saveProjectRecord } from "./save-project"
import { listSnapshots, readSnapshots } from "./snapshots"
import { uniqueDbName } from "./test-utils/db-name"
import { edited, testProject } from "./test-utils/projects"

let db: StorageDb

beforeEach(async () => {
  db = (await openStorageDb({ name: uniqueDbName() }))!
})

afterEach(() => db.close())

const at = (minute: number) => `2026-10-24T08:${String(minute).padStart(2, "0")}:00.000Z`
const now = (minute: number) => new Date(at(minute))

describe("saveProjectRecord", () => {
  it("writes and reads back a project", async () => {
    const project = testProject(1, { "buildings.total": 12 })
    const result = await saveProjectRecord(db, project, { base: null, now: now(0) })
    expect(result).toEqual({ conflict: false, snapshot: null, backup: null })
    expect(await readProjectRecord(db, project.meta.id)).toEqual(project)
  })

  it("keeps the previous state as an autosave snapshot at most every interval", async () => {
    const v1 = testProject(1)
    await saveProjectRecord(db, v1, { base: null, now: now(0) })
    const v2 = edited(v1, { "buildings.total": 2 }, at(1))
    expect((await saveProjectRecord(db, v2, { base: v1.meta.updatedAt, now: now(1) })).snapshot).toBe("autosave")
    const v3 = edited(v2, { "buildings.total": 3 }, at(2))
    expect((await saveProjectRecord(db, v3, { base: v2.meta.updatedAt, now: now(2) })).snapshot).toBeNull()
    const v4 = edited(v3, { "buildings.total": 4 }, at(7))
    expect((await saveProjectRecord(db, v4, { base: v3.meta.updatedAt, now: now(7) })).snapshot).toBe("autosave")

    const kept = await readSnapshots(db, v1.meta.id)
    expect(kept.map((record) => (record.project as typeof v1).buildings.total)).toEqual([3, null])
  })

  it("keeps a version written by another tab as a conflict snapshot", async () => {
    const mine = testProject(1)
    await saveProjectRecord(db, mine, { base: null, now: now(0) })
    const theirs = edited(mine, { "meta.name": "Theirs" }, at(1))
    await saveProjectRecord(db, theirs, { base: mine.meta.updatedAt, now: now(1) })

    const mineAgain = edited(mine, { "meta.name": "Mine" }, at(2))
    const result = await saveProjectRecord(db, mineAgain, { base: mine.meta.updatedAt, now: now(2) })
    expect(result.conflict).toBe(true)
    expect(result.snapshot).toBe("conflict")
    const [newest] = await listSnapshots(db, mine.meta.id)
    expect(newest).toMatchObject({ reason: "conflict", name: "Theirs" })
    expect(await readProjectRecord(db, mine.meta.id)).toEqual(mineAgain)
  })

  it("uses an explicit reason, and takes no autosave snapshot of an unchanged or missing record", async () => {
    const v1 = testProject(1)
    expect((await saveProjectRecord(db, v1, { base: null, now: now(0), snapshotReason: "before-import" })).snapshot).toBeNull()
    expect((await saveProjectRecord(db, v1, { base: v1.meta.updatedAt, now: now(0) })).snapshot).toBeNull()
    const v2 = edited(v1, { "buildings.total": 2 }, at(1))
    expect((await saveProjectRecord(db, v2, { base: null, now: now(1), snapshotReason: "before-restore" })).snapshot).toBe("before-restore")
    // An event keeps the replaced state even when both carry the same time.
    const sameTime = edited(v2, { "buildings.total": 3 }, at(1))
    expect((await saveProjectRecord(db, sameTime, { base: null, now: now(1), snapshotReason: "before-import" })).snapshot).toBe("before-import")
  })

  it("counts edits for the export reminder", async () => {
    const project = testProject(1)
    const first = await saveProjectRecord(db, project, { base: null, now: now(0), countsAsEdit: true })
    expect(first.backup).toMatchObject({ editsSinceExport: 1, pendingSince: at(0) })
    await saveProjectRecord(db, project, { base: project.meta.updatedAt, now: now(1), countsAsEdit: true })
    expect((await readBackup(db, project.meta.id)).editsSinceExport).toBe(2)
  })

  it("rotates snapshots to the limit", async () => {
    let project = testProject(1)
    await saveProjectRecord(db, project, { base: null, now: now(0) })
    for (let minute = 1; minute <= 5; minute++) {
      const next = edited(project, { "buildings.total": minute }, at(minute))
      await saveProjectRecord(db, next, { base: project.meta.updatedAt, now: now(minute), intervalMs: 0, maxSnapshots: 3 })
      project = next
    }
    expect(await listSnapshots(db, project.meta.id)).toHaveLength(3)
  })
})

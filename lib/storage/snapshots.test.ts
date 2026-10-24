// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { openStorageDb, type StorageDb } from "./idb"
import { STORE } from "./keys"
import { MAX_SNAPSHOTS } from "./limits"
import {
  addSnapshot,
  deleteSnapshots,
  getSnapshot,
  isSnapshotDue,
  listDeletedProjects,
  listSnapshots,
  readSnapshots,
} from "./snapshots"
import { uniqueDbName } from "./test-utils/db-name"
import { edited, testId, testProject } from "./test-utils/projects"
import type { SnapshotRecord } from "./types"

let db: StorageDb

beforeEach(async () => {
  db = (await openStorageDb({ name: uniqueDbName() }))!
})

afterEach(() => db.close())

const at = (minute: number) => `2026-10-24T08:${String(minute).padStart(2, "0")}:00.000Z`

describe("snapshots", () => {
  it("keeps the newest 20 per project (rolling) and lists them newest first", async () => {
    const project = testProject(1)
    for (let minute = 0; minute < MAX_SNAPSHOTS + 5; minute++) {
      await addSnapshot(db, { projectId: project.meta.id, takenAt: at(minute), reason: "autosave", project: edited(project, { "buildings.total": minute + 1 }, at(minute)) })
    }
    await addSnapshot(db, { projectId: testId(2), takenAt: at(0), reason: "before-delete", project: testProject(2) })

    const list = await listSnapshots(db, project.meta.id)
    expect(list).toHaveLength(MAX_SNAPSHOTS)
    expect(list[0].takenAt).toBe(at(MAX_SNAPSHOTS + 4))
    expect(list.at(-1)!.takenAt).toBe(at(5))
    expect(list[0]).toMatchObject({ projectId: project.meta.id, reason: "autosave", name: "Project 1", updatedAt: at(MAX_SNAPSHOTS + 4) })
    expect(await listSnapshots(db, testId(2))).toHaveLength(1)
  })

  it("returns one snapshot with its data", async () => {
    const project = testProject(1)
    const id = await addSnapshot(db, { projectId: project.meta.id, takenAt: at(1), reason: "before-restore", project })
    expect(await getSnapshot(db, id)).toEqual({ id, projectId: project.meta.id, takenAt: at(1), reason: "before-restore", project })
    expect(await getSnapshot(db, id + 100)).toBeUndefined()
    expect((await readSnapshots(db, project.meta.id))[0].project).toEqual(project)
  })

  it("lists deleted projects: snapshots without a record, newest snapshot each", async () => {
    const kept = testProject(1)
    const deleted = testProject(2)
    await db.put(STORE.projects, kept, kept.meta.id)
    await addSnapshot(db, { projectId: kept.meta.id, takenAt: at(1), reason: "autosave", project: kept })
    await addSnapshot(db, { projectId: deleted.meta.id, takenAt: at(1), reason: "autosave", project: deleted })
    await addSnapshot(db, { projectId: deleted.meta.id, takenAt: at(2), reason: "before-delete", project: deleted })

    const list = await listDeletedProjects(db)
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ projectId: deleted.meta.id, reason: "before-delete", takenAt: at(2) })
  })

  it("deletes every snapshot of a project", async () => {
    await addSnapshot(db, { projectId: testId(1), takenAt: at(1), reason: "autosave", project: testProject(1) })
    await addSnapshot(db, { projectId: testId(2), takenAt: at(1), reason: "autosave", project: testProject(2) })
    await deleteSnapshots(db, testId(1))
    expect(await listSnapshots(db, testId(1))).toEqual([])
    expect(await listSnapshots(db, testId(2))).toHaveLength(1)
  })
})

describe("isSnapshotDue", () => {
  const record = (takenAt: string): SnapshotRecord => ({ projectId: testId(1), takenAt, reason: "autosave", project: null })
  const now = new Date(at(10))

  it("is due without a snapshot, after the interval, or when the clock went back", () => {
    expect(isSnapshotDue(undefined, now, 5 * 60_000)).toBe(true)
    expect(isSnapshotDue(record(at(4)), now, 5 * 60_000)).toBe(true)
    expect(isSnapshotDue(record(at(5)), now, 5 * 60_000)).toBe(true)
    expect(isSnapshotDue(record(at(6)), now, 5 * 60_000)).toBe(false)
    expect(isSnapshotDue(record(at(30)), now, 5 * 60_000)).toBe(true)
  })
})

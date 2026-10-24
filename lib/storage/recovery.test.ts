// @vitest-environment node
import { describe, expect, it } from "vitest"
import type { MirrorEntry } from "./mirror"
import { recoverProjects, type RecoverySources } from "./recovery"
import { edited, testId, testProject } from "./test-utils/projects"

const mirror = (project: unknown): MirrorEntry => ({ savedAt: "2026-10-24T08:00:00.000Z", project })

function sources(
  records: [string, unknown][],
  mirrors: [string, MirrorEntry][] = [],
  snapshots: Record<string, unknown[]> = {},
): RecoverySources {
  return { records: new Map(records), mirrors: new Map(mirrors), snapshots: async (id) => snapshots[id] ?? [] }
}

describe("recoverProjects (IndexedDB → mirror → latest snapshot)", () => {
  it("loads valid records as they are", async () => {
    const project = testProject(1)
    const report = await recoverProjects(sources([[testId(1), project]], [[testId(1), mirror(project)]]))
    expect(report).toEqual({ projects: [{ project, from: "indexeddb", writeBack: false, migrated: false }], unreadable: [] })
  })

  it("takes the mirror when it is newer (the tab closed before IndexedDB finished)", async () => {
    const stored = testProject(1)
    const newer = edited(stored, { "meta.name": "Newer" }, "2026-10-24T09:00:00.000Z")
    const report = await recoverProjects(sources([[testId(1), stored]], [[testId(1), mirror(newer)]]))
    expect(report.projects[0]).toEqual({ project: newer, from: "mirror", writeBack: true, migrated: false })
  })

  it("keeps the record when the mirror is older or damaged", async () => {
    const stored = edited(testProject(1), { "meta.name": "Stored" }, "2026-10-24T09:00:00.000Z")
    const older = testProject(1)
    expect((await recoverProjects(sources([[testId(1), stored]], [[testId(1), mirror(older)]]))).projects[0].from).toBe("indexeddb")
    expect((await recoverProjects(sources([[testId(1), stored]], [[testId(1), mirror({})]]))).projects[0].from).toBe("indexeddb")
  })

  it("falls back to the mirror when the record is missing or damaged", async () => {
    const project = testProject(1)
    expect((await recoverProjects(sources([], [[testId(1), mirror(project)]]))).projects[0]).toMatchObject({ from: "mirror", writeBack: true })
    expect((await recoverProjects(sources([[testId(1), { meta: {} }]], [[testId(1), mirror(project)]]))).projects[0].from).toBe("mirror")
  })

  it("falls back to the newest valid snapshot when record and mirror are unusable", async () => {
    const older = testProject(1)
    const newer = edited(older, { "meta.name": "Snapshot" }, "2026-10-24T09:00:00.000Z")
    const report = await recoverProjects(sources([[testId(1), { damaged: true }]], [], { [testId(1)]: [{ bad: 1 }, newer, older] }))
    expect(report.projects[0]).toEqual({ project: newer, from: "snapshot", writeBack: true, migrated: false })
  })

  it("leaves unreadable data alone and reports it", async () => {
    const report = await recoverProjects(sources([[testId(1), { damaged: true }], [testId(2), { meta: { schemaVersion: 1 } }]], [[testId(3), mirror("x")]]))
    expect(report.projects).toEqual([])
    expect(report.unreadable).toEqual([
      { id: testId(1), code: "missing-version" },
      { id: testId(2), code: "invalid" },
      { id: testId(3), code: "not-object" },
    ])
  })

  it("never replaces a record from a newer app version, even with a valid mirror", async () => {
    const report = await recoverProjects(sources([[testId(1), { meta: { schemaVersion: 99 } }]], [[testId(1), mirror(testProject(1))]]))
    expect(report.projects).toEqual([])
    expect(report.unreadable).toEqual([{ id: testId(1), code: "newer-version" }])
  })

  it("rejects a copy filed under the wrong id", async () => {
    const report = await recoverProjects(sources([[testId(9), testProject(1)]]))
    expect(report.unreadable).toEqual([{ id: testId(9), code: "id-mismatch" }])
  })
})

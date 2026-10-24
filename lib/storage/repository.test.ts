// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest"
import { METHODOLOGY_VERSION } from "@/lib/project"
import { openStorageDb, readProjectRecord, type StorageDb } from "./idb"
import { STORE } from "./keys"
import { readMirror, writeMirror } from "./mirror"
import { createRepository } from "./repository"
import { addSnapshot, listSnapshots } from "./snapshots"
import { uniqueDbName } from "./test-utils/db-name"
import { MemoryStorage } from "./test-utils/memory-storage"
import { edited, testId, testProject } from "./test-utils/projects"

const dbs: StorageDb[] = []
const now = () => new Date("2026-10-24T10:00:00.000Z")

async function setup(local: Storage | null = new MemoryStorage()) {
  const db = (await openStorageDb({ name: uniqueDbName() }))!
  dbs.push(db)
  return { db, local, repo: createRepository({ db, local, now }) }
}

afterEach(() => {
  while (dbs.length) dbs.pop()!.close()
})

describe("repository (IndexedDB + mirror)", () => {
  it("saves to both stores and reads back", async () => {
    const { db, local, repo } = await setup()
    const project = testProject(1)
    expect(repo.mode).toBe("indexeddb")
    expect(await repo.save(project, { base: null })).toMatchObject({ ok: true, mirrored: true, conflict: false })
    expect(await readProjectRecord(db, testId(1))).toEqual(project)
    expect(readMirror(local, testId(1))?.project).toEqual(project)
    expect(await repo.read(testId(1))).toEqual(project)
    expect(await repo.read(testId(2))).toBeNull()
  })

  it("stamps the current methodology version on save", async () => {
    const { db, repo } = await setup()
    const old = { ...testProject(1), meta: { ...testProject(1).meta, methodologyVersion: "0.9.0" } }
    await repo.save(old, { base: null })
    expect(((await readProjectRecord(db, testId(1))) as typeof old).meta.methodologyVersion).toBe(METHODOLOGY_VERSION)
  })

  it("reads IndexedDB (the last write of any tab), and the mirror only when the record is gone", async () => {
    const { db, local, repo } = await setup()
    const project = testProject(1)
    await repo.save(project, { base: null })
    // Another tab wrote an older edit last: IndexedDB wins, whatever the edit times say.
    writeMirror(local, edited(project, { "meta.name": "Mirror" }, "2026-10-24T11:00:00.000Z"), now())
    expect((await repo.read(testId(1)))?.meta.name).toBe("Project 1")
    await db.delete(STORE.projects, testId(1))
    expect((await createRepository({ db, local, now }).read(testId(1)))?.meta.name).toBe("Mirror")
  })

  it("still saves to IndexedDB when the mirror is full", async () => {
    const { repo } = await setup(new MemoryStorage({ quota: 10 }))
    expect(await repo.save(testProject(1), { base: null })).toMatchObject({ ok: true, mirrored: false })
    expect(repo.mirror(testProject(1))).toBe(false)
  })

  it("reports a failed IndexedDB write, keeping the mirror copy", async () => {
    const { db, local, repo } = await setup()
    db.close()
    const outcome = await repo.save(testProject(1), { base: null })
    expect(outcome).toEqual({ ok: false, error: "unavailable", mirrored: true })
    expect(readMirror(local, testId(1))).not.toBeNull()
    // This tab keeps reading its unsaved state until a save succeeds.
    const unsaved = edited(testProject(1), { "meta.name": "Unsaved" }, "2026-10-24T11:00:00.000Z")
    await repo.save(unsaved, { base: null })
    expect(await repo.read(testId(1))).toEqual(unsaved)
    expect(await createRepository({ db: null, local: null, now }).read(testId(1))).toBeNull()
  })

  it("loads everything and writes back what came from the mirror", async () => {
    const { db, local, repo } = await setup()
    const stored = testProject(1)
    await repo.save(stored, { base: null })
    const newer = edited(stored, { "meta.name": "Newer" }, "2026-10-24T11:00:00.000Z")
    writeMirror(local, newer, now())
    writeMirror(local, testProject(2), now())

    const report = await createRepository({ db, local, now }).loadAll()
    expect(report.projects.map((entry) => [entry.project.meta.id, entry.from])).toEqual(
      expect.arrayContaining([
        [testId(1), "mirror"],
        [testId(2), "mirror"],
      ]),
    )
    expect(((await readProjectRecord(db, testId(1))) as typeof stored).meta.name).toBe("Newer")
    expect(await readProjectRecord(db, testId(2))).toEqual(testProject(2))
    expect((await listSnapshots(db, testId(1)))[0]).toMatchObject({ reason: "recovery", name: "Project 1" })
  })

  it("recovers a damaged record from its newest snapshot and keeps the mirror in step", async () => {
    const { db, local, repo } = await setup()
    const good = testProject(1)
    await addSnapshot(db, { projectId: testId(1), takenAt: now().toISOString(), reason: "autosave", project: good })
    await db.put(STORE.projects, { damaged: true }, testId(1))
    const report = await repo.loadAll()
    expect(report.projects[0]).toMatchObject({ from: "snapshot", project: good })
    expect(await readProjectRecord(db, testId(1))).toEqual(good)
    expect(readMirror(local, testId(1))?.project).toEqual(good)
  })

  it("removes a project but keeps a snapshot; purge removes everything", async () => {
    const { local, repo } = await setup()
    const project = testProject(1)
    await repo.save(project, { base: null })
    const snapshotId = await repo.remove(testId(1), project)
    expect(snapshotId).toEqual(expect.any(Number))
    expect(readMirror(local, testId(1))).toBeNull()
    expect(await repo.read(testId(1))).toBeNull()
    expect(await repo.getSnapshot(snapshotId!)).toMatchObject({ reason: "before-delete" })
    expect((await repo.listDeleted()).map((entry) => entry.projectId)).toEqual([testId(1)])

    await repo.purge(testId(1))
    expect(await repo.listSnapshots(testId(1))).toEqual([])
    expect(await repo.listDeleted()).toEqual([])
  })

  it("keeps export bookkeeping and file links", async () => {
    const { repo } = await setup()
    const next = await repo.updateBackup(testId(1), (state) => ({ ...state, editsSinceExport: 4 }))
    expect(await repo.readBackup(testId(1))).toEqual(next)
    expect(await repo.addSnapshot(testId(1), testProject(1), "conflict")).toEqual(expect.any(Number))
  })
})

describe("repository with a full localStorage (D-11: never drop the only copy)", () => {
  const big = (n: number) => edited(testProject(n), { "site.name": "x".repeat(200), "businessPlan.opportunity.needs": "x".repeat(2_000) }, "2026-10-24T11:00:00.000Z")
  const quota = () => (JSON.stringify({ savedAt: now().toISOString(), project: testProject(1) }).length + 100) * 2

  it("mirror-only: a save that does not fit fails and keeps the other projects", async () => {
    const local = new MemoryStorage({ quota: quota() })
    const repo = createRepository({ db: null, local, now })
    await repo.save(testProject(1), { base: null })
    await repo.save(testProject(2), { base: null })
    expect(await repo.save(big(2), { base: null })).toEqual({ ok: false, error: "quota-exceeded", mirrored: false })
    expect(repo.mirror(big(2))).toBe(false)
    const report = await createRepository({ db: null, local, now }).loadAll()
    expect(report.projects.map((entry) => entry.project.meta.id).sort()).toEqual([testId(1), testId(2)])
  })

  it("IndexedDB: keeps the mirror of a project whose IndexedDB save failed", async () => {
    const { db, local, repo } = await setup(new MemoryStorage({ quota: quota() }))
    const failing = createRepository({ db, local, now })
    await repo.save(testProject(2), { base: null })
    db.close()
    // Project 1 cannot reach IndexedDB: its mirror is its only persistent copy.
    expect(await failing.save(testProject(1), { base: null })).toEqual({ ok: false, error: "unavailable", mirrored: true })
    expect(await failing.save(big(2), { base: null })).toMatchObject({ ok: false, mirrored: false })
    expect(failing.mirror(big(2))).toBe(false)
    expect(readMirror(local, testId(1))).not.toBeNull()
  })

  it("IndexedDB: drops the mirror of a project safely in IndexedDB to make room", async () => {
    const { db, local, repo } = await setup(new MemoryStorage({ quota: quota() }))
    await repo.save(testProject(1), { base: null })
    await repo.save(testProject(2), { base: null })
    expect(await repo.save(big(2), { base: null })).toMatchObject({ ok: true, mirrored: true })
    expect(readMirror(local, testId(1))).toBeNull()
    expect(await readProjectRecord(db, testId(1))).toEqual(testProject(1))
  })
})

describe("repository without IndexedDB", () => {
  it("runs on the mirror only", async () => {
    const local = new MemoryStorage()
    const repo = createRepository({ db: null, local, now })
    expect(repo.mode).toBe("mirror-only")
    expect(await repo.save(testProject(1), { base: null })).toMatchObject({ ok: true, mirrored: true })
    const report = await createRepository({ db: null, local, now }).loadAll()
    expect(report.projects.map((entry) => entry.from)).toEqual(["mirror"])
    expect(await repo.remove(testId(1), null)).toBeNull()
    expect(await repo.listSnapshots(testId(1))).toEqual([])
    expect(await repo.getSnapshot(1)).toBeNull()
    expect(await repo.listDeleted()).toEqual([])
    expect(await repo.addSnapshot(testId(1), testProject(1), "conflict")).toBeNull()
    expect((await repo.updateBackup(testId(1), (state) => ({ ...state, editsSinceExport: 2 }))).editsSinceExport).toBe(2)
    expect((await repo.readBackup(testId(1))).editsSinceExport).toBe(0)
    await expect(repo.purge(testId(1))).resolves.toBeUndefined()
  })

  it("reports a full mirror", async () => {
    const repo = createRepository({ db: null, local: new MemoryStorage({ quota: 10 }), now })
    expect(await repo.save(testProject(1), { base: null })).toEqual({ ok: false, error: "quota-exceeded", mirrored: false })
  })

  it("keeps projects in the tab only when nothing can store them", async () => {
    const repo = createRepository({ db: null, local: null, now })
    expect(repo.mode).toBe("memory")
    expect(await repo.save(testProject(1), { base: null })).toEqual({ ok: false, error: "unavailable", mirrored: false })
    expect(await repo.read(testId(1))).toEqual(testProject(1))
    expect((await repo.loadAll()).projects).toEqual([])
    repo.close()
  })
})

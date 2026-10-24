// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
import { STORE } from "./keys"
import { nameOf, openStorageDb, readProjectRecord, readProjectRecords, updatedAtOf, type StorageDb } from "./idb"
import { uniqueDbName } from "./test-utils/db-name"
import { testId, testProject } from "./test-utils/projects"

let db: StorageDb | null = null

afterEach(() => {
  db?.close()
  db = null
  vi.unstubAllGlobals()
})

describe("openStorageDb", () => {
  it("creates the stores on first use", async () => {
    db = await openStorageDb({ name: uniqueDbName() })
    expect(db).not.toBeNull()
    expect([...db!.objectStoreNames].sort()).toEqual([...Object.values(STORE)].sort())
    expect([...db!.transaction(STORE.snapshots).store.indexNames]).toEqual(["projectId"])
  })

  it("writes and reads raw project records by id", async () => {
    db = await openStorageDb({ name: uniqueDbName() })
    const project = testProject(1)
    await db!.put(STORE.projects, project, project.meta.id)
    await db!.put(STORE.projects, { broken: true }, "damaged")
    expect(await readProjectRecord(db!, project.meta.id)).toEqual(project)
    const records = await readProjectRecords(db!)
    expect([...records.keys()].sort()).toEqual(["damaged", testId(1)].sort())
  })

  it("resolves null without IndexedDB", async () => {
    vi.stubGlobal("indexedDB", undefined)
    expect(await openStorageDb({ name: uniqueDbName() })).toBeNull()
  })

  it("resolves null when opening fails or hangs", async () => {
    vi.stubGlobal("indexedDB", {
      open: () => {
        throw new DOMException("blocked", "SecurityError")
      },
    })
    expect(await openStorageDb({ name: uniqueDbName() })).toBeNull()

    vi.stubGlobal("indexedDB", { open: () => ({}) })
    expect(await openStorageDb({ name: uniqueDbName(), timeoutMs: 10 })).toBeNull()
  })

  it("closes and reports when another tab needs a newer version", async () => {
    const name = uniqueDbName()
    const onClosed = vi.fn()
    db = await openStorageDb({ name, onClosed })
    const { openDB } = await import("idb")
    const newer = await openDB(name, 99)
    expect(onClosed).toHaveBeenCalledTimes(1)
    newer.close()
  })
})

describe("record helpers", () => {
  it("read updatedAt and name of raw records defensively", () => {
    const project = testProject(1)
    expect(updatedAtOf(project)).toBe(project.meta.updatedAt)
    expect(nameOf(project)).toBe("Project 1")
    for (const raw of [null, 3, {}, { meta: null }, { meta: { updatedAt: 1, name: 2 } }]) {
      expect(updatedAtOf(raw)).toBeNull()
      expect(nameOf(raw)).toBeNull()
    }
  })
})

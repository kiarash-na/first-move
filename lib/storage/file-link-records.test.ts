// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest"
import { fileLinkRecords } from "./file-link-records"
import { openStorageDb, type StorageDb } from "./idb"
import { uniqueDbName } from "./test-utils/db-name"

let db: StorageDb | null = null

afterEach(() => db?.close())

const record = { projectId: "p", handle: { kind: "file", name: "x.json" } as unknown as FileSystemFileHandle, fileName: "x.json", linkedAt: "2026-10-24T08:00:00.000Z" }

describe("file link records", () => {
  it("stores the handle per project", async () => {
    db = await openStorageDb({ name: uniqueDbName() })
    const records = fileLinkRecords(db)
    expect(await records.get("p")).toBeNull()
    await records.put(record)
    expect(await records.get("p")).toEqual(record)
    await records.delete("p")
    expect(await records.get("p")).toBeNull()
  })

  it("is a no-op without IndexedDB", async () => {
    const records = fileLinkRecords(null)
    await records.put(record)
    expect(await records.get("p")).toBeNull()
    await expect(records.delete("p")).resolves.toBeUndefined()
  })
})

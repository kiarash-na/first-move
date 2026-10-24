// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { readBackup, updateBackup } from "./backups"
import { openStorageDb, type StorageDb } from "./idb"
import { emptyBackup, recordEdit } from "./reminder"
import { uniqueDbName } from "./test-utils/db-name"

let db: StorageDb

beforeEach(async () => {
  db = (await openStorageDb({ name: uniqueDbName() }))!
})

afterEach(() => db.close())

describe("backup bookkeeping", () => {
  it("is empty until changed, then persists", async () => {
    expect(await readBackup(db, "p")).toEqual(emptyBackup("p"))
    const now = new Date("2026-10-24T08:00:00.000Z")
    const next = await updateBackup(db, "p", (state) => recordEdit(state, now))
    expect(next.editsSinceExport).toBe(1)
    expect(await readBackup(db, "p")).toEqual(next)
  })
})

import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { openDB } from "idb"
import { afterEach, describe, expect, it } from "vitest"
import { openStorageDb, readProjectRecords } from "@/lib/storage/idb"
import { DB_NAME, MIRROR_PREFIX } from "@/lib/storage/keys"
import { readSnapshots } from "@/lib/storage/snapshots"
import { testBrowser, testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { VAULT_DB_NAME } from "./db"
import { rememberKey } from "./vault"

const KEY = "vck_VAULTONLY_abcdefghijklmnopqrstuvwx7777"

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : []
  })
}

describe("the vault never reaches project data (D-50)", () => {
  it("uses another database than the projects, and storage code never opens it", () => {
    expect(VAULT_DB_NAME).not.toBe(DB_NAME)
    const files = ["lib/storage", "lib/store"].flatMap((dir) => sourceFiles(join(process.cwd(), dir)))
    expect(files.filter((path) => /first-move-assistant|lib\/assistant/.test(readFileSync(path, "utf8")))).toEqual([])
  })

  it("is in no export, snapshot, mirror entry or project record", async () => {
    const browser = testBrowser()
    await rememberKey("gateway", KEY, "482915", { iterations: 1000 })
    const tab = testTab(browser)
    tabs.push(tab)
    await tab.store.start()
    const project = await tab.store.create({ modules: { quickCheck: true, businessPlan: true }, name: "Isolated" })
    for (let edit = 1; edit <= 3; edit++) {
      tab.store.patch({ "buildings.total": edit })
      tab.tick(60 * 60 * 1000)
      expect(await tab.store.flush()).toBe(true)
    }
    const exported = (await tab.store.exportProject())!.text
    const db = (await openStorageDb({ name: browser.dbName }))!
    const records = JSON.stringify([...(await readProjectRecords(db)).values()])
    const snapshots = JSON.stringify(await readSnapshots(db, project.meta.id))
    db.close()
    const keys = Array.from({ length: browser.local.length }, (_, index) => browser.local.key(index)!)
    expect(keys.some((key) => key.startsWith(MIRROR_PREFIX))).toBe(true)
    const mirror = keys.map((key) => `${key}=${browser.local.getItem(key)}`).join("\n")

    for (const text of [exported, records, snapshots, mirror]) {
      expect(text).not.toContain("VAULTONLY")
      expect(text).not.toContain(VAULT_DB_NAME)
    }
    expect(snapshots.length).toBeGreaterThan(2)

    // The vault record is where it belongs, sealed.
    const vault = await openDB(VAULT_DB_NAME)
    expect(await vault.count("vault")).toBe(1)
    vault.close()
  })
})

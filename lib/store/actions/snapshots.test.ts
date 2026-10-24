// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest"
import { openStorageDb } from "@/lib/storage/idb"
import { addSnapshot } from "@/lib/storage/snapshots"
import { testBrowser, testTab, until, type TestTab } from "../test-utils/harness"

const tabs: TestTab[] = []
const open = async (browser = testBrowser()) => {
  const tab = testTab(browser)
  tabs.push(tab)
  await tab.store.start()
  return tab
}

afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

const MINUTE = 60_000

async function editAndSave(tab: TestTab, total: number) {
  tab.store.patch({ "buildings.total": total })
  tab.tick(400)
  await until(tab, (state) => state.save.state === "saved" && state.active?.buildings.total === total)
  await tab.store.flush()
}

describe("snapshots (20 rolling, restore)", () => {
  it("keeps older states while editing, at most every 5 minutes", async () => {
    const tab = await open()
    const project = await tab.store.create({ modules: { quickCheck: true } })
    tab.tick(MINUTE)
    await editAndSave(tab, 1)
    tab.tick(MINUTE)
    await editAndSave(tab, 2)
    tab.tick(6 * MINUTE)
    await editAndSave(tab, 3)

    const list = await tab.store.listSnapshots(project.meta.id)
    expect(list.map((entry) => entry.reason)).toEqual(["autosave", "autosave"])
  })

  it("restores a snapshot and keeps the replaced state as a snapshot too", async () => {
    const tab = await open()
    const project = await tab.store.create({ modules: { quickCheck: true } })
    tab.tick(MINUTE)
    await editAndSave(tab, 1)
    tab.tick(6 * MINUTE)
    await editAndSave(tab, 2)
    const [newest] = await tab.store.listSnapshots(project.meta.id)

    tab.tick(MINUTE)
    const result = await tab.store.restoreSnapshot(newest.id)
    expect(result).toMatchObject({ ok: true, project: { buildings: { total: 1 } } })
    expect(tab.store.getState().active?.buildings.total).toBe(1)
    expect((await tab.store.listSnapshots(project.meta.id))[0].reason).toBe("before-restore")
  })

  it("restores a deleted project from its snapshot", async () => {
    const tab = await open()
    const project = await tab.store.create({ modules: { quickCheck: true }, name: "Gone" })
    await tab.store.remove(project.meta.id)
    const [deleted] = await tab.store.listDeleted()
    expect(await tab.store.restoreSnapshot(deleted.id)).toMatchObject({ ok: true })
    expect(tab.store.getState().projects.map((entry) => entry.name)).toEqual(["Gone"])
  })

  it("reports missing and unreadable snapshots", async () => {
    const browser = testBrowser()
    const tab = await open(browser)
    expect(await tab.store.restoreSnapshot(999)).toEqual({ ok: false, code: "not-found" })
    const db = (await openStorageDb({ name: browser.dbName }))!
    const id = await addSnapshot(db, { projectId: "p", takenAt: new Date().toISOString(), reason: "autosave", project: { meta: { schemaVersion: 1 } } })
    db.close()
    expect(await tab.store.restoreSnapshot(id)).toEqual({ ok: false, code: "invalid" })
  })

  it("lists nothing without IndexedDB", async () => {
    const tab = testTab(testBrowser(), { db: null })
    tabs.push(tab)
    await tab.store.start()
    expect(await tab.store.listSnapshots("p")).toEqual([])
    expect(await tab.store.listDeleted()).toEqual([])
  })
})

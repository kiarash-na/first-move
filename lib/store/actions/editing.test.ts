// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
import { openStorageDb, readProjectRecord, type StorageDb } from "@/lib/storage/idb"
import { readMirror } from "@/lib/storage/mirror"
import { saveProjectRecord } from "@/lib/storage/save-project"
import { testId, testProject } from "@/lib/storage/test-utils/projects"
import { testBrowser, testTab, until, type TabOptions, type TestTab } from "../test-utils/harness"

const tabs: TestTab[] = []
const dbs: StorageDb[] = []
const open = async (browser = testBrowser(), options: TabOptions = {}) => {
  const tab = testTab(browser, options)
  tabs.push(tab)
  await tab.store.start()
  return tab
}

afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
  while (dbs.length) dbs.pop()!.close()
})

async function storedRecord(browser: ReturnType<typeof testBrowser>, id: string) {
  const db = (await openStorageDb({ name: browser.dbName }))!
  dbs.push(db)
  return readProjectRecord(db, id) as Promise<ReturnType<typeof testProject> | undefined>
}

describe("patch (autosave, debounced 400 ms)", () => {
  it("returns null without an open project", async () => {
    const tab = await open()
    expect(tab.store.patch({ "buildings.total": 1 })).toBeNull()
  })

  it("applies at once and saves once after 400 ms without further edits", async () => {
    const browser = testBrowser()
    const tab = await open(browser)
    const project = await tab.store.create({ modules: { quickCheck: true } })
    const id = project.meta.id

    tab.tick(1000)
    tab.store.patch({ "buildings.total": 5 })
    tab.tick(200)
    const result = tab.store.patch({ "buildings.total": 12 })
    expect(result?.ok).toBe(true)
    expect(tab.store.getState().active?.buildings.total).toBe(12)
    expect(tab.store.getState().save.state).toBe("saving")

    tab.tick(399)
    expect((await storedRecord(browser, id))?.buildings.total).toBeNull()
    tab.tick(1)
    await until(tab, (state) => state.save.state === "saved")
    expect((await storedRecord(browser, id))?.buildings.total).toBe(12)
    expect(readMirror(browser.local, id)?.project).toMatchObject({ buildings: { total: 12 } })
    expect(tab.store.getState().save.savedAt).toBe(new Date(browser.clock.now).toISOString())
  })

  it("reports field errors and does not save an invalid value", async () => {
    const tab = await open()
    await tab.store.create({ modules: { quickCheck: true } })
    const before = tab.store.getState().active
    const result = tab.store.patch({ "buildings.total": -1 })
    expect(result).toMatchObject({ ok: false, errors: [{ path: "buildings.total", code: "min" }] })
    expect(tab.store.getState().active).toBe(before)
    expect(tab.timers.pending).toBe(0)
  })

  it("updates the project list with the new name and time", async () => {
    const tab = await open()
    await tab.store.create({ modules: { quickCheck: true }, name: "Old" })
    tab.tick(60_000)
    tab.store.patch({ "meta.name": "New" })
    expect(tab.store.getState().projects[0]).toMatchObject({ name: "New", updatedAt: new Date(tab.deps.now()).toISOString() })
  })

  it("shows a save error, keeps the mirror copy and retries", async () => {
    const browser = testBrowser()
    let db: StorageDb | null = null
    const tab = await open(browser, {
      overrides: {
        openDb: async (onClosed) => (db = await openStorageDb({ name: browser.dbName, onClosed })),
      },
    })
    await tab.store.create({ modules: { quickCheck: true } })
    db!.close()
    tab.store.patch({ "buildings.total": 4 })
    tab.tick(400)
    await until(tab, (state) => state.save.state === "error")
    expect(tab.store.getState().save).toMatchObject({ error: "unavailable", mirrored: true })
    expect(readMirror(browser.local, tab.store.getState().activeId!)?.project).toMatchObject({ buildings: { total: 4 } })
    // A retry is scheduled.
    expect(tab.timers.pending).toBe(1)
  })
})

describe("open and close", () => {
  it("opens a stored project and remembers it", async () => {
    const browser = testBrowser()
    const db = (await openStorageDb({ name: browser.dbName }))!
    await saveProjectRecord(db, testProject(1), { base: null, now: new Date() })
    db.close()
    const tab = await open(browser)

    expect(await tab.store.open("missing")).toBe(false)
    expect(await tab.store.open(testId(1))).toBe(true)
    expect(await tab.store.open(testId(1))).toBe(true)
    expect(tab.store.getState()).toMatchObject({ activeId: testId(1), lastUsedId: testId(1), save: { state: "saved", savedAt: testProject(1).meta.updatedAt } })
    expect(tab.session.getItem("first-move:active-project")).toBe(testId(1))

    await tab.store.close()
    expect(tab.store.getState()).toMatchObject({ activeId: null, active: null, lastUsedId: testId(1), save: { state: "idle" } })
    expect(tab.session.getItem("first-move:active-project")).toBeNull()
  })

  it("still saves edits of a project that was closed before the debounce ran", async () => {
    const browser = testBrowser()
    const tab = await open(browser)
    const project = await tab.store.create({ modules: { quickCheck: true } })
    tab.store.patch({ "buildings.total": 9 })
    await tab.store.close()
    tab.tick(400)
    await vi.waitFor(async () => expect((await storedRecord(browser, project.meta.id))?.buildings.total).toBe(9))
    expect(await tab.store.open(project.meta.id)).toBe(true)
    expect(tab.store.getState().active?.buildings.total).toBe(9)
  })
})

describe("patchProject (from the project list)", () => {
  it("renames a project that is not open, and the open one through autosave", async () => {
    const browser = testBrowser()
    const tab = await open(browser)
    const first = await tab.store.create({ modules: { quickCheck: true }, name: "First" })
    const second = await tab.store.create({ modules: { quickCheck: true }, name: "Second" })
    tab.tick(1000)

    expect((await tab.store.rename(first.meta.id, "Renamed"))?.ok).toBe(true)
    expect((await storedRecord(browser, first.meta.id))?.meta.name).toBe("Renamed")
    expect(tab.store.getState().projects.find((entry) => entry.id === first.meta.id)?.name).toBe("Renamed")

    expect((await tab.store.rename(second.meta.id, "Open one"))?.ok).toBe(true)
    expect(tab.store.getState().active?.meta.name).toBe("Open one")
    expect(await tab.store.flush()).toBe(true)
    expect((await storedRecord(browser, second.meta.id))?.meta.name).toBe("Open one")
  })

  it("rejects bad patches and unknown projects", async () => {
    const tab = await open()
    const project = await tab.store.create({ modules: { quickCheck: true }, open: false })
    expect(await tab.store.patchProject(project.meta.id, { "meta.modules.quickCheck": false })).toMatchObject({ ok: false })
    expect(await tab.store.patchProject("missing", { "meta.name": "x" })).toBeNull()
  })
})

import { afterEach, describe, expect, it, vi } from "vitest"
import { openStorageDb } from "@/lib/storage/idb"
import { STORE } from "@/lib/storage/keys"
import { readMirror, writeMirror } from "@/lib/storage/mirror"
import { saveProjectRecord } from "@/lib/storage/save-project"
import { edited, testId, testProject } from "@/lib/storage/test-utils/projects"
import { testBrowser, testTab, until, type TabOptions, type TestTab } from "../test-utils/harness"

const tabs: TestTab[] = []
const open = (browser = testBrowser(), options: TabOptions = {}) => {
  const tab = testTab(browser, options)
  tabs.push(tab)
  return tab
}

afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

async function seed(browser: ReturnType<typeof testBrowser>, ...projects: ReturnType<typeof testProject>[]) {
  const db = (await openStorageDb({ name: browser.dbName }))!
  for (const project of projects) await saveProjectRecord(db, project, { base: null, now: new Date() })
  db.close()
}

describe("start", () => {
  it("loads once, even when called again (idempotent effects)", async () => {
    const tab = open()
    const openDb = vi.spyOn(tab.deps, "openDb")
    expect(tab.store.getState().phase).toBe("idle")
    const first = tab.store.start()
    expect(tab.store.getState().phase).toBe("loading")
    await Promise.all([first, tab.store.start(), tab.store.start()])
    expect(openDb).toHaveBeenCalledTimes(1)
    expect(tab.store.getState()).toMatchObject({ phase: "ready", mode: "indexeddb", projects: [], activeId: null })
  })

  it("restores this tab's project after a reload, else the last used one", async () => {
    const browser = testBrowser()
    await seed(browser, testProject(1), testProject(2))
    const first = open(browser)
    await first.store.start()
    await first.store.open(testId(1))
    await first.store.open(testId(2))
    first.store.stop()

    const reloaded = open(browser, { session: first.session })
    await reloaded.store.start()
    expect(reloaded.store.getState()).toMatchObject({ activeId: testId(2), lastUsedId: testId(2) })
    expect(reloaded.store.getState().active?.meta.id).toBe(testId(2))

    const newTab = open(browser)
    await newTab.store.start()
    expect(newTab.store.getState().activeId).toBe(testId(2))
  })

  it("ignores remembered ids of projects that no longer exist", async () => {
    const browser = testBrowser()
    browser.local.setItem("first-move:last-project", "gone")
    const tab = open(browser)
    await tab.store.start()
    expect(tab.store.getState()).toMatchObject({ activeId: null, lastUsedId: null })
  })

  it("asks for persistent storage when there is data, and only checks space otherwise", async () => {
    const empty = open()
    await empty.store.start()
    await vi.waitFor(() => expect(empty.storageManager.estimate).toHaveBeenCalled())
    expect(empty.storageManager.persist).not.toHaveBeenCalled()

    const browser = testBrowser()
    await seed(browser, testProject(1))
    const withData = open(browser)
    await withData.store.start()
    await vi.waitFor(() => expect(withData.storageManager.persist).toHaveBeenCalledTimes(1))
  })

  it("runs on the mirror when IndexedDB is unavailable, with a warning", async () => {
    const browser = testBrowser()
    writeMirror(browser.local, testProject(1), new Date())
    const tab = open(browser, { db: null })
    await tab.store.start()
    await until(tab, (state) => state.health.warning === "unavailable")
    expect(tab.store.getState()).toMatchObject({ mode: "mirror-only", notices: [] })
    expect(tab.store.getState().projects.map((entry) => entry.id)).toEqual([testId(1)])
  })

  it("falls back to the mirror when reading IndexedDB fails", async () => {
    const browser = testBrowser()
    writeMirror(browser.local, testProject(1), new Date())
    const tab = open(browser, {
      overrides: {
        openDb: async () => {
          const db = (await openStorageDb({ name: browser.dbName }))!
          db.close()
          return db
        },
      },
    })
    await tab.store.start()
    expect(tab.store.getState()).toMatchObject({ mode: "mirror-only", phase: "ready" })
  })

  it("reports projects recovered from the mirror and data it could not read", async () => {
    const browser = testBrowser()
    const stored = testProject(1)
    await seed(browser, stored)
    writeMirror(browser.local, edited(stored, { "meta.name": "Newer" }, "2026-10-24T09:00:00.000Z"), new Date())
    const db = (await openStorageDb({ name: browser.dbName }))!
    await db.put(STORE.projects, { damaged: true }, "damaged")
    db.close()

    const tab = open(browser)
    await tab.store.start()
    const kinds = tab.store.getState().notices.map((notice) => [notice.kind, notice.count])
    expect(kinds).toEqual([
      ["recovered", 1],
      ["unreadable", 1],
    ])
    expect(tab.store.getState().projects[0].name).toBe("Newer")
  })

  it("asks for a reload when another tab opens a newer database version", async () => {
    const browser = testBrowser()
    const tab = open(browser)
    await tab.store.start()
    const { openDB } = await import("idb")
    const newer = await openDB(browser.dbName, 99)
    expect(tab.store.getState().notices.map((notice) => notice.kind)).toContain("reload-required")
    newer.close()
  })
})

describe("data safety on leaving the page", () => {
  it("keeps an edit made just before the tab closes (PLAN-DASH-04 verification)", async () => {
    const browser = testBrowser()
    const tab = open(browser, { window })
    await tab.store.start()
    await tab.store.create({ modules: { quickCheck: true }, name: "Valley" })
    tab.store.patch({ "buildings.total": 12 })
    const id = tab.store.getState().activeId!

    // No debounce tick: the tab is closed mid-edit.
    window.dispatchEvent(new Event("pagehide"))
    expect((readMirror(browser.local, id)?.project as ReturnType<typeof testProject>).buildings.total).toBe(12)
    tab.store.stop()

    const reloaded = open(browser, { session: tab.session })
    await reloaded.store.start()
    expect(reloaded.store.getState().active?.buildings.total).toBe(12)
  })

  it("does not block leaving when the change is kept, and warns when it is not", async () => {
    const browser = testBrowser()
    const tab = open(browser, { window })
    await tab.store.start()
    await tab.store.create({ modules: { quickCheck: true } })
    tab.store.patch({ "buildings.total": 3 })
    const kept = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(kept)
    expect(kept.defaultPrevented).toBe(false)
    await tab.store.flush()

    const memoryOnly = open(testBrowser(), { window, db: null, overrides: { localStorage: () => null } })
    await memoryOnly.store.start()
    await memoryOnly.store.create({ modules: { quickCheck: true } })
    memoryOnly.store.patch({ "buildings.total": 3 })
    const lost = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(lost)
    expect(lost.defaultPrevented).toBe(true)
    await until(memoryOnly, (state) => state.save.state === "error")
    expect(memoryOnly.store.getState()).toMatchObject({ mode: "memory", save: { error: "unavailable" } })
  })

  it("follows the last used project of other tabs", async () => {
    const tab = open(testBrowser(), { window })
    await tab.store.start()
    window.dispatchEvent(new StorageEvent("storage", { key: "first-move:last-project", newValue: "other" }))
    expect(tab.store.getState().lastUsedId).toBe("other")
    window.dispatchEvent(new StorageEvent("storage", { key: "first-move:theme", newValue: "light" }))
    expect(tab.store.getState().lastUsedId).toBe("other")
  })
})

describe("stop", () => {
  it("resets the state so the store can start again", async () => {
    const tab = open()
    await tab.store.start()
    await tab.store.create({ modules: { businessPlan: true } })
    tab.store.stop()
    tab.store.stop()
    expect(tab.store.getState()).toBe(tab.store.getInitialState())
    await tab.store.start()
    expect(tab.store.getState().projects).toHaveLength(1)
  })
})

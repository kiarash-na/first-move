// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest"
import { readMirror } from "@/lib/storage/mirror"
import { testBrowser, testTab, type TestTab } from "../test-utils/harness"

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

describe("remove (delete keeps a snapshot, so undo works)", () => {
  it("deletes the open project, including unsaved edits in the kept state", async () => {
    const browser = testBrowser()
    const tab = await open(browser)
    const project = await tab.store.create({ modules: { quickCheck: true } })
    const id = project.meta.id
    tab.store.patch({ "buildings.total": 30 })

    const receipt = await tab.store.remove(id)
    expect(receipt).toMatchObject({ projectId: id, wasActive: true, snapshotId: expect.any(Number) })
    expect(receipt!.project.buildings.total).toBe(30)
    expect(tab.store.getState()).toMatchObject({ projects: [], activeId: null, active: null, lastUsedId: null })
    expect(readMirror(browser.local, id)).toBeNull()
    expect(browser.local.getItem("first-move:last-project")).toBeNull()
    tab.tick(1000)
    expect((await tab.store.listDeleted()).map((entry) => [entry.projectId, entry.reason])).toEqual([[id, "before-delete"]])
  })

  it("undo brings it back as it was and reopens it", async () => {
    const tab = await open()
    const project = await tab.store.create({ modules: { quickCheck: true } })
    tab.store.patch({ "buildings.total": 30 })
    const receipt = (await tab.store.remove(project.meta.id))!
    const restored = await tab.store.undoRemove(receipt)
    expect(restored.buildings.total).toBe(30)
    expect(tab.store.getState()).toMatchObject({ activeId: project.meta.id })
    expect(tab.store.getState().projects).toHaveLength(1)
    expect(await tab.store.listDeleted()).toEqual([])
  })

  it("deletes a project that is not open and returns null for unknown ones", async () => {
    const tab = await open()
    const kept = await tab.store.create({ modules: { quickCheck: true } })
    const other = await tab.store.create({ modules: { quickCheck: true }, open: false })
    expect((await tab.store.remove(other.meta.id))?.wasActive).toBe(false)
    expect(tab.store.getState().activeId).toBe(kept.meta.id)
    expect(await tab.store.remove("missing")).toBeNull()
  })

  it("purge removes a project and its snapshots for good", async () => {
    const tab = await open()
    const project = await tab.store.create({ modules: { quickCheck: true } })
    await tab.store.purge(project.meta.id)
    expect(tab.store.getState().projects).toEqual([])
    expect(await tab.store.listDeleted()).toEqual([])
    expect(await tab.store.listSnapshots(project.meta.id)).toEqual([])
  })
})

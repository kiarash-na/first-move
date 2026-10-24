// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest"
import { testBrowser, testTab, until, type TestTab } from "../test-utils/harness"

const tabs: TestTab[] = []
async function twoTabs() {
  const browser = testBrowser()
  const a = testTab(browser, { tabId: "a" })
  const b = testTab(browser, { tabId: "b" })
  tabs.push(a, b)
  await a.store.start()
  await b.store.start()
  return { a, b }
}

afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

async function save(tab: TestTab) {
  tab.tick(400)
  await tab.store.flush()
}

const kinds = (tab: TestTab) => tab.store.getState().notices.map((notice) => notice.kind)

describe("cross-tab sync (D-11)", () => {
  it("shows projects created in another tab", async () => {
    const { a, b } = await twoTabs()
    const project = await a.store.create({ modules: { quickCheck: true }, name: "From A" })
    await until(b, (state) => state.projects.some((entry) => entry.id === project.meta.id))
    expect(b.store.getState().projects[0].name).toBe("From A")
    expect(b.store.getState().activeId).toBeNull()
  })

  it("follows a newer save of the open project and says so", async () => {
    const { a, b } = await twoTabs()
    const project = await a.store.create({ modules: { quickCheck: true } })
    await until(b, (state) => state.projects.length === 1)
    await b.store.open(project.meta.id)

    a.tick(1000)
    a.store.patch({ "buildings.total": 42 })
    await save(a)
    await until(b, (state) => state.active?.buildings.total === 42)
    expect(kinds(b)).toEqual(["changed-elsewhere"])
    expect(kinds(a)).toEqual([])
  })

  it("keeps this tab's unsaved edits on a conflict and saves the other version as a snapshot", async () => {
    const { a, b } = await twoTabs()
    const project = await a.store.create({ modules: { quickCheck: true } })
    await until(b, (state) => state.projects.length === 1)
    await b.store.open(project.meta.id)

    b.tick(1000)
    b.store.patch({ "buildings.total": 7 })
    a.tick(1000)
    a.store.patch({ "meta.name": "Other tab" })
    await save(a)
    await until(b, (state) => state.notices.some((notice) => notice.kind === "conflict"))
    expect(b.store.getState().active?.buildings.total).toBe(7)

    await save(b)
    const snapshots = await b.store.listSnapshots(project.meta.id)
    expect(snapshots.find((entry) => entry.reason === "conflict")?.name).toBe("Other tab")
    // Tab A follows B's winning version.
    await until(a, (state) => state.active?.buildings.total === 7)
  })

  it("closes a project deleted in another tab and keeps unsaved edits as a snapshot", async () => {
    const { a, b } = await twoTabs()
    const project = await a.store.create({ modules: { quickCheck: true } })
    await until(b, (state) => state.projects.length === 1)
    await b.store.open(project.meta.id)
    b.store.patch({ "buildings.total": 5 })

    await a.store.remove(project.meta.id)
    await until(b, (state) => state.activeId === null)
    expect(b.store.getState().projects).toEqual([])
    expect(kinds(b)).toEqual(["deleted-elsewhere"])
    const reasons = (await b.store.listSnapshots(project.meta.id)).map((entry) => entry.reason)
    expect(reasons).toEqual(expect.arrayContaining(["deleted-elsewhere", "before-delete"]))
  })

  it("drops a deleted project from the list silently when it was not open", async () => {
    const { a, b } = await twoTabs()
    const project = await a.store.create({ modules: { quickCheck: true } })
    await until(b, (state) => state.projects.length === 1)
    await a.store.remove(project.meta.id)
    await until(b, (state) => state.projects.length === 0)
    expect(kinds(b)).toEqual([])
  })
})

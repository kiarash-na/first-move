// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest"
import { testProject } from "@/lib/storage/test-utils/projects"
import { testBrowser, testTab, type TestTab } from "../test-utils/harness"

const tabs: TestTab[] = []
const open = async () => {
  const tab = testTab(testBrowser())
  tabs.push(tab)
  await tab.store.start()
  return tab
}

afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("create (path tiles, D-03)", () => {
  it("creates a project with the chosen modules and opens it", async () => {
    const tab = await open()
    const project = await tab.store.create({ modules: { businessPlan: true }, name: "Village" })
    expect(project.meta).toMatchObject({ name: "Village", modules: { quickCheck: false, businessPlan: true } })
    expect(tab.store.getState()).toMatchObject({ activeId: project.meta.id, lastUsedId: project.meta.id, save: { state: "saved" } })
    expect(tab.store.getState().projects.map((entry) => entry.id)).toEqual([project.meta.id])
  })

  it("can create without opening", async () => {
    const tab = await open()
    const project = await tab.store.create({ modules: { quickCheck: true }, open: false })
    expect(tab.store.getState().activeId).toBeNull()
    expect(await tab.store.open(project.meta.id)).toBe(true)
  })
})

describe("addCopy (examples, D-04)", () => {
  it("adds a copy with a new id and keeps the example link", async () => {
    const tab = await open()
    const example = { ...testProject(1, { "buildings.total": 8 }), meta: { ...testProject(1).meta, exampleId: "rural-village" } }
    const copy = await tab.store.addCopy(example)
    expect(copy.meta.id).not.toBe(example.meta.id)
    expect(copy.meta.exampleId).toBe("rural-village")
    expect(copy.buildings.total).toBe(8)
    expect(tab.store.getState().activeId).toBe(copy.meta.id)
    const again = await tab.store.addCopy(example, { name: "Second try", open: false })
    expect(again.meta.name).toBe("Second try")
    expect(tab.store.getState().projects).toHaveLength(2)
  })
})

describe("duplicate (D-29)", () => {
  it("copies the newest state under the given name without opening it", async () => {
    const tab = await open()
    const source = await tab.store.create({ modules: { quickCheck: true }, name: "Model A" })
    tab.store.patch({ "buildings.total": 21 })
    const copy = await tab.store.duplicate(source.meta.id, { name: "Model B" })
    expect(copy).toMatchObject({ meta: { name: "Model B" }, buildings: { total: 21 } })
    expect(tab.store.getState().activeId).toBe(source.meta.id)
    expect(tab.store.getState().projects).toHaveLength(2)
    expect(await tab.store.duplicate("missing")).toBeNull()
  })

  it("duplicates a project that is not open", async () => {
    const tab = await open()
    const source = await tab.store.create({ modules: { quickCheck: true }, name: "Closed", open: false })
    expect((await tab.store.duplicate(source.meta.id))?.meta.name).toBe("Closed")
  })
})

// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest"
import { parseImportText } from "@/lib/storage/import"
import { REMINDER_RULES } from "@/lib/storage/limits"
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

const fileOf = (text: string) => new Blob([text], { type: "application/json" })

describe("export", () => {
  it("exports the open project with its pending edits", async () => {
    const tab = await open()
    await tab.store.create({ modules: { quickCheck: true }, name: "Valley" })
    tab.store.patch({ "buildings.total": 14 })
    const file = await tab.store.exportProject()
    expect(file?.fileName).toMatch(/^valley-.*\.firstmove\.json$/)
    expect(JSON.parse(file!.text).project.buildings.total).toBe(14)
  })

  it("exports a project that is not open, and nothing for unknown ids", async () => {
    const tab = await open()
    const project = await tab.store.create({ modules: { quickCheck: true }, name: "Closed", open: false })
    expect((await tab.store.exportProject(project.meta.id))?.fileName).toMatch(/^closed-/)
    expect(await tab.store.exportProject("missing")).toBeNull()
    expect(await tab.store.exportProject()).toBeNull()
  })

  it("reminds to export after many edits, and an export clears the reminder", async () => {
    const tab = await open()
    await tab.store.create({ modules: { quickCheck: true } })
    for (let edit = 1; edit <= REMINDER_RULES.edits; edit++) {
      tab.store.patch({ "buildings.total": edit })
      tab.tick(400)
      expect(await tab.store.flush()).toBe(true)
    }
    await until(tab, (state) => state.notices.some((notice) => notice.kind === "export-reminder"))
    await tab.store.exportProject()
    expect(tab.store.getState().notices.some((notice) => notice.kind === "export-reminder")).toBe(false)
  })
})

describe("import", () => {
  it("round trip: export, delete, import gives the same data (D-13, phase 11 flow)", async () => {
    const tab = await open()
    const project = await tab.store.create({ modules: { quickCheck: true, businessPlan: true }, name: "Valley" })
    tab.store.patch({ "buildings.total": 14, "sources.potentials.waste_heat": "medium", "businessPlan.opportunity.painPoint": "Gas prices" })
    const file = (await tab.store.exportProject())!
    const exported = tab.store.getState().active!
    await tab.store.remove(project.meta.id)

    const result = await tab.store.importFile(fileOf(file.text))
    expect(result).toMatchObject({ ok: true, replaced: false, copied: false })
    const imported = tab.store.getState().active!
    expect(imported.meta.id).toBe(project.meta.id)
    expect({ ...imported, meta: { ...imported.meta, updatedAt: null } }).toEqual({ ...exported, meta: { ...exported.meta, updatedAt: null } })
  })

  it("adds a copy when the project already exists, or replaces it on request", async () => {
    const tab = await open()
    const project = await tab.store.create({ modules: { quickCheck: true }, name: "Valley" })
    const file = (await tab.store.exportProject())!

    const copy = await tab.store.importFile(fileOf(file.text))
    expect(copy).toMatchObject({ ok: true, copied: true, replaced: false })
    expect(copy.ok && copy.project.meta.id).not.toBe(project.meta.id)
    expect(tab.store.getState().projects).toHaveLength(2)

    await tab.store.open(project.meta.id)
    tab.tick(60_000)
    tab.store.patch({ "buildings.total": 99 })
    const replaced = await tab.store.importFile(fileOf(file.text), { onConflict: "replace" })
    expect(replaced).toMatchObject({ ok: true, replaced: true })
    expect(tab.store.getState().active?.buildings.total).toBeNull()
    const [snapshot] = await tab.store.listSnapshots(project.meta.id)
    expect(snapshot.reason).toBe("before-import")
  })

  it("returns the errors of a bad file and adds nothing", async () => {
    const tab = await open()
    const result = await tab.store.importFile(fileOf("{ not json"))
    expect(result).toMatchObject({ ok: false, code: "not-json" })
    expect(tab.store.getState().projects).toEqual([])
  })

  it("adopts an already validated import without opening it", async () => {
    const tab = await open()
    const project = await tab.store.create({ modules: { quickCheck: true }, open: false })
    const file = (await tab.store.exportProject(project.meta.id))!
    await tab.store.remove(project.meta.id)
    const parsed = parseImportText(file.text)
    if (!parsed.ok) throw new Error("export must be importable")
    const outcome = await tab.store.adoptImport(parsed, { open: false })
    expect(outcome.ok).toBe(true)
    expect(tab.store.getState().activeId).toBeNull()
    expect(tab.store.getState().projects).toHaveLength(1)
  })
})

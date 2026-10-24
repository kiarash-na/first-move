import { screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { UNKNOWN_HEALTH } from "@/lib/storage/persist"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { createProject } from "@/lib/project"
import { testDictionaries } from "../test-utils/dictionaries"
import { fakeStore } from "../test-utils/fake-store"
import { renderDashboard } from "../test-utils/render"
import { SaveStatus } from "./save-status"

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

const project = createProject({ modules: { quickCheck: true }, id: "00000000-0000-4000-8000-000000000001", now: new Date() })

describe("SaveStatus (D-08)", () => {
  it("is a skeleton until the store is ready", () => {
    const { store } = fakeStore({ phase: "loading" })
    renderDashboard(<SaveStatus />, { store })
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
    expect(screen.getByLabelText(testDictionaries().shell.loading)).toBeInTheDocument()
  })

  it.each(["en", "de"] as const)("says when no project is open (%s)", (lang) => {
    const { store } = fakeStore()
    renderDashboard(<SaveStatus />, { store, lang })
    expect(screen.getByRole("status")).toHaveTextContent(testDictionaries(lang).shell.saveStatus.noProject)
  })

  it("shows the save time of the open project", async () => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    await tab.store.create({ modules: { quickCheck: true } })
    renderDashboard(<SaveStatus />, { store: tab.store })
    const status = await screen.findByRole("status")
    expect(status).toHaveAttribute("data-status", "saved")
    expect(status.textContent).toMatch(/^Saved \d\d:\d\d$/)
  })

  it("shows a save error in orange with its explanation", () => {
    const { store } = fakeStore({
      active: project,
      save: { state: "error", savedAt: null, error: "quota-exceeded", mirrored: true },
    })
    renderDashboard(<SaveStatus />, { store })
    const status = screen.getByRole("status")
    const { shell } = testDictionaries()
    expect(status).toHaveTextContent(shell.storage.saveStatus.error)
    expect(status.className).toContain("text-hot")
    expect(status).toHaveAccessibleName(expect.stringContaining(shell.storage.saveError["quota-exceeded"]))
    expect(status).toHaveAccessibleName(expect.stringContaining(shell.storage.saveError.mirrored))
  })

  it("warns when storage is at risk", () => {
    const { store } = fakeStore({
      active: project,
      save: { state: "saved", savedAt: project.meta.updatedAt, error: null, mirrored: false },
      health: { ...UNKNOWN_HEALTH, warning: "low-space" },
    })
    renderDashboard(<SaveStatus />, { store })
    const status = screen.getByRole("status")
    expect(status).toHaveAttribute("data-status", "storage-warning")
    expect(within(status).getByText(/storage at risk/)).toBeInTheDocument()
  })
})

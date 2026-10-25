import { screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { exampleCards } from "@/lib/dashboard/example-cards"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { UNKNOWN_HEALTH } from "@/lib/storage/persist"
import { ImportProvider } from "../_components/import/import-provider"
import { testDictionaries } from "../_components/test-utils/dictionaries"
import { fakeStore } from "../_components/test-utils/fake-store"
import { renderDashboard } from "../_components/test-utils/render"
import { StartScreen } from "./start-screen"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("StartScreen (D-03)", () => {
  it.each(["en", "de"] as const)("has every section of the start screen (%s)", async (lang) => {
    const tab = testTab()
    tabs.push(tab)
    const { start } = testDictionaries(lang)
    renderDashboard(
      <ImportProvider>
        <StartScreen examples={exampleCards(lang)} />
      </ImportProvider>,
      { store: tab.store, lang },
    )
    expect(screen.getByRole("heading", { level: 1, name: start.header.title })).toBeInTheDocument()
    // Static parts render before the store is ready; data parts show skeletons.
    expect(screen.getByRole("heading", { name: start.paths.title })).toBeInTheDocument()
    // The examples come last and start collapsed (owner, 2026-10-24).
    expect(screen.queryAllByRole("article")).toHaveLength(0)
    expect(screen.getByRole("heading", { name: start.examples.title })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: start.import.title })).toBeInTheDocument()
    expect(screen.getAllByLabelText(testDictionaries(lang).shell.loading).length).toBeGreaterThan(0)
    await tab.store.start()
    expect(await screen.findByRole("heading", { name: start.continue.welcomeTitle })).toBeInTheDocument()
    expect(screen.getByText(start.projects.empty)).toBeInTheDocument()
  })

  it("puts the user's projects before the collapsed examples", () => {
    const { store } = fakeStore()
    renderDashboard(
      <ImportProvider>
        <StartScreen examples={exampleCards("en")} />
      </ImportProvider>,
      { store },
    )
    const { start } = testDictionaries()
    const projects = screen.getByRole("heading", { name: start.projects.title })
    const examples = screen.getByRole("heading", { name: start.examples.title })
    expect(projects.compareDocumentPosition(examples) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("places the storage warning after the Continue/Import row, so its late arrival does not push the first screen down", () => {
    const { store } = fakeStore({ health: { ...UNKNOWN_HEALTH, warning: "not-persisted" } })
    const { container } = renderDashboard(
      <ImportProvider>
        <StartScreen examples={exampleCards("en")} />
      </ImportProvider>,
      { store },
    )
    const banner = container.querySelector("[data-warning]")
    expect(banner).not.toBeNull()
    const importZone = screen.getByRole("region", { name: testDictionaries().start.import.title })
    expect(importZone.compareDocumentPosition(banner!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})

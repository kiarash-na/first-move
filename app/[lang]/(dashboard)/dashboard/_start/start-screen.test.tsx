import { screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { exampleCards } from "@/lib/dashboard/example-cards"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { ImportProvider } from "../_components/import/import-provider"
import { testDictionaries } from "../_components/test-utils/dictionaries"
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
    expect(screen.getAllByRole("article")).toHaveLength(6)
    expect(screen.getByRole("region", { name: start.import.title })).toBeInTheDocument()
    expect(screen.getAllByLabelText(testDictionaries(lang).shell.loading).length).toBeGreaterThan(0)
    await tab.store.start()
    expect(await screen.findByRole("heading", { name: start.continue.welcomeTitle })).toBeInTheDocument()
    expect(screen.getByText(start.projects.empty)).toBeInTheDocument()
  })
})

import { screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { ImportProvider } from "../import/import-provider"
import { testDictionaries } from "../test-utils/dictionaries"
import { renderDashboard } from "../test-utils/render"
import { TopBar } from "./top-bar"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/en/dashboard" }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("TopBar (D-08)", () => {
  it.each(["en", "de"] as const)("has save status, export, import, report, language, theme and the project menu (%s)", async (lang) => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    const { shell, common } = testDictionaries(lang)
    renderDashboard(
      <ImportProvider>
        <TopBar />
      </ImportProvider>,
      { store: tab.store, lang },
    )
    expect(await screen.findByRole("status")).toBeInTheDocument()
    const toolbar = screen.getByRole("toolbar", { name: shell.topBar.label })
    expect(toolbar).toContainElement(screen.getByRole("button", { name: shell.topBar.export }))
    expect(toolbar).toContainElement(screen.getByRole("button", { name: shell.topBar.import }))
    expect(toolbar).toContainElement(screen.getByRole("button", { name: new RegExp(shell.topBar.report) }))
    expect(screen.getByRole("navigation", { name: common.language.label })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: common.theme.switchToLight })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: `${shell.projectMenu.label}: ${shell.nav.noProject}` })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: shell.nav.open })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument()
  })
})

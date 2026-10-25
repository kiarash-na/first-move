import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { DashboardShell } from "./dashboard-shell"
import { I18nProvider } from "./i18n-provider"
import { ProjectStoreProvider } from "./store-provider"
import { testDictionaries } from "./test-utils/dictionaries"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/en/dashboard" }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("DashboardShell", () => {
  it.each(["en", "de"] as const)("starts the store once and frames the page with sidebar and top bar (%s)", async (lang) => {
    const tab = testTab()
    tabs.push(tab)
    const start = vi.spyOn(tab.store, "start")
    const { shell } = testDictionaries(lang)
    render(
      <I18nProvider lang={lang} dictionaries={testDictionaries(lang)}>
        <ProjectStoreProvider store={tab.store}>
          <DashboardShell>
            <p>page</p>
          </DashboardShell>
        </ProjectStoreProvider>
      </I18nProvider>,
    )
    expect(screen.getByRole("main")).toHaveTextContent("page")
    expect(screen.getByRole("navigation", { name: shell.nav.label })).toBeInTheDocument()
    await waitFor(() => expect(tab.store.getState().phase).toBe("ready"))
    expect(start).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole("status")).toHaveTextContent(shell.saveStatus.noProject)
    // The AI assistant stays dark while `AI_FEATURES_LIVE` is off (`dashboard-shell.live.test.tsx` covers on).
    expect(document.querySelector("[data-slot='agent-launcher']")).toBeNull()
  })
})

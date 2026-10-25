import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import assistant from "@/dictionaries/en/assistant.json"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { DashboardShell } from "./dashboard-shell"
import { I18nProvider } from "./i18n-provider"
import { ProjectStoreProvider } from "./store-provider"
import { testDictionaries } from "./test-utils/dictionaries"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/en/dashboard" }))
// The go-live state of the AI assistant; `dashboard-shell.test.tsx` covers the switch off.
vi.mock("@/lib/legal/ai", async (original) => ({ ...(await original<typeof import("@/lib/legal/ai")>()), AI_FEATURES_LIVE: true }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("DashboardShell with the AI assistant live", () => {
  it("shows the Bot launcher bottom right, and the panel opens on its first click", async () => {
    const tab = testTab()
    tabs.push(tab)
    render(
      <I18nProvider lang="en" dictionaries={{ ...testDictionaries("en"), assistant }}>
        <ProjectStoreProvider store={tab.store}>
          <DashboardShell>
            <p>page</p>
          </DashboardShell>
        </ProjectStoreProvider>
      </I18nProvider>,
    )
    await waitFor(() => expect(tab.store.getState().phase).toBe("ready"))
    const launcher = screen.getByRole("button", { name: assistant.launcher.open })
    expect(launcher).toHaveAttribute("data-slot", "agent-launcher")
    expect(launcher).toHaveClass("fixed", "size-12")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    await userEvent.click(launcher)
    expect(await screen.findByRole("dialog", { name: assistant.panel.title }, { timeout: 10_000 })).toBeInTheDocument()
  })
})

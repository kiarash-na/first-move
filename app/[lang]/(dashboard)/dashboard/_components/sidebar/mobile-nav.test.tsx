import { act, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { SIDEBAR_ATTRIBUTE } from "@/lib/dashboard/sidebar-state"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { testDictionaries } from "../test-utils/dictionaries"
import { exampleProject, projectStore } from "../test-utils/project-store"
import { renderDashboard } from "../test-utils/render"
import { MobileNav } from "./mobile-nav"

vi.mock("next/navigation", () => ({ usePathname: () => "/de/dashboard" }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("MobileNav", () => {
  it.each(["en", "de"] as const)("opens the navigation in a sheet with language and theme, and closes on navigation (%s)", async (lang) => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    const { common, shell } = testDictionaries(lang)
    renderDashboard(<MobileNav />, { store: tab.store, lang })
    await userEvent.click(screen.getByRole("button", { name: shell.nav.open }))
    const sheet = screen.getByRole("dialog", { name: shell.nav.title })
    expect(sheet).toBeInTheDocument()
    expect(screen.getByRole("link", { name: `${common.language.short.de}, ${common.language.names.de}` })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: common.theme.switchToLight })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("link", { name: shell.nav.start }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("stays as it is while the desktop sidebar is collapsed: no rail toggle, buttons or tooltips (D-59)", async () => {
    document.documentElement.setAttribute(SIDEBAR_ATTRIBUTE, "collapsed")
    try {
      const { shell } = testDictionaries("en")
      renderDashboard(<MobileNav />, { store: projectStore(exampleProject("housing-cooperatives")).store })
      await userEvent.click(screen.getByRole("button", { name: shell.nav.open }))
      const sheet = screen.getByRole("dialog", { name: shell.nav.title })
      for (const name of [shell.nav.rail.collapse, shell.nav.rail.expand, shell.nav.rail.privacy]) {
        expect(within(sheet).queryByRole("button", { name })).not.toBeInTheDocument()
      }
      const buildings = within(sheet).getByRole("link", { name: shell.nav.items.quickCheck.buildings })
      expect(buildings).toHaveTextContent("02")
      expect(buildings.querySelector("svg")).toBeNull()
      await act(async () => buildings.focus())
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument()
      // The rail's styles apply only inside the desktop sidebar landmark.
      expect(sheet.closest("[data-slot=sidebar]")).toBeNull()
    } finally {
      document.documentElement.removeAttribute(SIDEBAR_ATTRIBUTE)
    }
  })
})

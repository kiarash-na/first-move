import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { testDictionaries } from "../test-utils/dictionaries"
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
    expect(screen.getByRole("link", { name: common.language.names.de })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: common.theme.switchToLight })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("link", { name: shell.nav.start }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})

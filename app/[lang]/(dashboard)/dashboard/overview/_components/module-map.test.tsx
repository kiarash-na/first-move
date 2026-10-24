import { screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { testDictionaries } from "../../_components/test-utils/dictionaries"
import { renderDashboard } from "../../_components/test-utils/render"
import { ModuleMap } from "./module-map"

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("ModuleMap", () => {
  it.each(["en", "de"] as const)("links every step of the modules that are on (%s)", async (lang) => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    await tab.store.create({ modules: { quickCheck: true, businessPlan: true } })
    const { shell } = testDictionaries(lang)
    renderDashboard(<ModuleMap />, { store: tab.store, lang })
    expect(screen.getByRole("region", { name: shell.nav.sections.quickCheck })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Energy sources/ })).toHaveAttribute("href", `/${lang}/dashboard/quick-check/sources`)
    expect(screen.getByRole("link", { name: /Reality check/ })).toHaveAttribute("href", `/${lang}/dashboard/business-plan/reality-check`)
  })

  it("renders nothing without an open project", () => {
    const tab = testTab()
    tabs.push(tab)
    const { container } = renderDashboard(<ModuleMap />, { store: tab.store })
    expect(container).toBeEmptyDOMElement()
  })
})

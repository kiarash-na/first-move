import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { testDictionaries } from "../test-utils/dictionaries"
import { renderDashboard } from "../test-utils/render"
import { ModulesDialog } from "./modules-dialog"

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("ModulesDialog (D-01)", () => {
  it.each(["en", "de"] as const)("turns modules on and keeps at least one (%s)", async (lang) => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    await tab.store.create({ modules: { quickCheck: true } })
    const { shell } = testDictionaries(lang)
    renderDashboard(<ModulesDialog open onOpenChange={() => {}} />, { store: tab.store, lang })
    const qc = screen.getByRole("switch", { name: shell.fields.meta.modules.quickCheck.label })
    const bp = screen.getByRole("switch", { name: shell.fields.meta.modules.businessPlan.label })
    expect(qc).toBeChecked()
    await userEvent.click(bp)
    expect(tab.store.getState().active?.meta.modules.businessPlan).toBe(true)
    await userEvent.click(qc)
    await userEvent.click(bp)
    expect(screen.getByRole("alert")).toHaveTextContent(shell.validation["at-least-one-module"])
    expect(tab.store.getState().active?.meta.modules).toEqual({ quickCheck: false, businessPlan: true })
  })
})

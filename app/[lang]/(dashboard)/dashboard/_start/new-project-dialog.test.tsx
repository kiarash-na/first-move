import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { testDictionaries } from "../_components/test-utils/dictionaries"
import { renderDashboard } from "../_components/test-utils/render"
import { NewProjectDialog } from "./new-project-dialog"

const push = vi.hoisted(() => vi.fn())
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("NewProjectDialog", () => {
  it.each(["en", "de"] as const)("creates a project with the default name (%s)", async (lang) => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    const onOpenChange = vi.fn()
    const { start } = testDictionaries(lang)
    renderDashboard(<NewProjectDialog path="business-plan" onOpenChange={onOpenChange} />, { store: tab.store, lang })
    await userEvent.click(screen.getByRole("button", { name: start.newProject.create }))
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
    expect(tab.store.getState().active?.meta).toMatchObject({ name: start.newProject.defaultName, modules: { quickCheck: false, businessPlan: true } })
    expect(push).toHaveBeenCalledWith(`/${lang}/dashboard/business-plan/opportunity`)
  })

  it("stays closed without a path", () => {
    renderDashboard(<NewProjectDialog path={null} onOpenChange={() => {}} />, { store: testTab().store })
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})

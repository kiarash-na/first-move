import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { testDictionaries } from "../_components/test-utils/dictionaries"
import { renderDashboard } from "../_components/test-utils/render"
import { PathTiles } from "./path-tiles"

const push = vi.hoisted(() => vi.fn())
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
  push.mockClear()
})

async function setup(lang: "en" | "de" = "en") {
  const tab = testTab()
  tabs.push(tab)
  await tab.store.start()
  renderDashboard(<PathTiles />, { store: tab.store, lang })
  return tab.store
}

describe("PathTiles (D-03)", () => {
  it.each([
    ["Quick Check", { quickCheck: true, businessPlan: false }, "/en/dashboard/quick-check/area"],
    ["Business Plan", { quickCheck: false, businessPlan: true }, "/en/dashboard/business-plan/opportunity"],
    ["Both", { quickCheck: true, businessPlan: true }, "/en/dashboard/quick-check/area"],
  ])("%s → name → create with the right modules → first step", async (title, modules, href) => {
    const store = await setup()
    await userEvent.click(screen.getByRole("button", { name: new RegExp(`^${title}`) }))
    const dialog = screen.getByRole("dialog", { name: "Name your project" })
    const input = within(dialog).getByLabelText("Project name")
    expect(input).toHaveValue("New project")
    await userEvent.clear(input)
    await userEvent.type(input, "Brewery site")
    await userEvent.click(within(dialog).getByRole("button", { name: "Create project" }))
    await waitFor(() => expect(push).toHaveBeenCalledWith(href))
    expect(store.getState().active?.meta.modules).toEqual(modules)
    expect(store.getState().active?.meta.name).toBe("Brewery site")
  })

  it("renders three tiles in DE and cancels without creating", async () => {
    const store = await setup("de")
    const { start } = testDictionaries("de")
    expect(screen.getAllByRole("button")).toHaveLength(3)
    await userEvent.click(screen.getByRole("button", { name: new RegExp(`^${start.paths.both.title}`) }))
    await userEvent.click(screen.getByRole("button", { name: start.newProject.cancel }))
    expect(store.getState().projects).toHaveLength(0)
    expect(push).not.toHaveBeenCalled()
  })
})

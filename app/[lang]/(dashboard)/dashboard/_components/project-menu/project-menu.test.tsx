import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { ImportProvider } from "../import/import-provider"
import { testDictionaries } from "../test-utils/dictionaries"
import { renderDashboard } from "../test-utils/render"
import { ProjectMenu } from "./project-menu"

const push = vi.hoisted(() => vi.fn())
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/en/dashboard/overview" }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
  push.mockClear()
})

async function setup(lang: "en" | "de" = "en", withProject = true) {
  const tab = testTab()
  tabs.push(tab)
  await tab.store.start()
  if (withProject) await tab.store.create({ modules: { quickCheck: true }, name: "Canal side" })
  renderDashboard(
    <ImportProvider>
      <ProjectMenu />
    </ImportProvider>,
    { store: tab.store, lang },
  )
  return tab.store
}

describe("ProjectMenu (D-08)", () => {
  it.each(["en", "de"] as const)("lists the project actions (%s)", async (lang) => {
    await setup(lang)
    const { shell } = testDictionaries(lang)
    await userEvent.click(screen.getByRole("button", { name: `${shell.projectMenu.label}: Canal side` }))
    for (const item of ["rename", "duplicate", "modules", "restore", "close", "delete"] as const) {
      expect(screen.getByRole("menuitem", { name: shell.projectMenu[item] })).toBeInTheDocument()
    }
    // File links exist only where the File System Access API does (D-12).
    expect(screen.queryByRole("menuitem", { name: shell.projectMenu.linkFile })).not.toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: new RegExp(shell.topBar.reportSoon) })).toHaveAttribute("aria-disabled", "true")
  })

  it("opens the rename dialog from the menu", async () => {
    await setup()
    await userEvent.click(screen.getByRole("button", { name: /Project menu/ }))
    await userEvent.click(screen.getByRole("menuitem", { name: "Rename" }))
    expect(await screen.findByRole("dialog", { name: "Rename project" })).toBeInTheDocument()
  })

  it("gives focus back to the menu button when a dialog closes (keyboard users keep their place)", async () => {
    await setup()
    const trigger = screen.getByRole("button", { name: /Project menu/ })
    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole("menuitem", { name: "Rename" }))
    await screen.findByRole("dialog", { name: "Rename project" })
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("keeps one fixed-width button while the store loads, so the top bar does not shift", () => {
    const tab = testTab()
    tabs.push(tab)
    renderDashboard(
      <ImportProvider>
        <ProjectMenu />
      </ImportProvider>,
      { store: tab.store },
    )
    const loading = screen.getByRole("button", { name: "Project menu" })
    expect(loading).toHaveClass("lg:w-64")
    expect(loading).toHaveTextContent("")
  })

  it("closes the project and goes to the start screen", async () => {
    const store = await setup()
    await userEvent.click(screen.getByRole("button", { name: /Project menu/ }))
    await userEvent.click(screen.getByRole("menuitem", { name: "Close project" }))
    await waitFor(() => expect(store.getState().active).toBeNull())
    expect(push).toHaveBeenCalledWith("/en/dashboard")
  })

  it("deletes after confirmation and goes to the start screen", async () => {
    const store = await setup()
    await userEvent.click(screen.getByRole("button", { name: /Project menu/ }))
    await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }))
    await userEvent.click(await screen.findByRole("button", { name: "Delete project" }))
    await waitFor(() => expect(store.getState().projects).toHaveLength(0))
    expect(push).toHaveBeenCalledWith("/en/dashboard")
  })

  it("disables project actions without an open project", async () => {
    await setup("en", false)
    await userEvent.click(screen.getByRole("button", { name: "Project menu: No project open" }))
    expect(screen.getByRole("menuitem", { name: "Rename" })).toHaveAttribute("aria-disabled", "true")
    expect(screen.queryByRole("menuitem", { name: "Delete" })).not.toBeInTheDocument()
  })
})

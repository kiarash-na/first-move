import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { testTab, type TestTab } from "@/lib/store/test-utils/harness"
import { testDictionaries } from "../_components/test-utils/dictionaries"
import { renderDashboard } from "../_components/test-utils/render"
import { ProjectList } from "./project-list"

const push = vi.hoisted(() => vi.fn())
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))

const tabs: TestTab[] = []
afterEach(() => {
  while (tabs.length) tabs.pop()!.store.stop()
})

describe("ProjectList (D-02)", () => {
  it.each(["en", "de"] as const)("says when there are no projects (%s)", async (lang) => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    renderDashboard(<ProjectList />, { store: tab.store, lang })
    expect(await screen.findByText(testDictionaries(lang).start.projects.empty)).toBeInTheDocument()
  })

  it("lists projects newest first and opens, duplicates and deletes them", async () => {
    const tab = testTab()
    tabs.push(tab)
    await tab.store.start()
    await tab.store.create({ modules: { quickCheck: true }, name: "Alpha", open: false })
    tab.tick(1000)
    await tab.store.create({ modules: { quickCheck: true }, name: "Beta", open: false })
    renderDashboard(<ProjectList />, { store: tab.store })
    const rows = await screen.findAllByRole("listitem")
    expect(rows.map((row) => row.textContent)).toEqual([expect.stringContaining("Beta"), expect.stringContaining("Alpha")])
    expect(screen.getByText("2 in this browser")).toBeInTheDocument()

    await userEvent.click(screen.getAllByRole("button", { name: "Duplicate" })[1])
    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(3))
    expect(screen.getByText("Alpha (copy)")).toBeInTheDocument()

    await userEvent.click(screen.getAllByRole("button", { name: "Delete" })[0])
    await userEvent.click(await screen.findByRole("button", { name: "Delete project" }))
    await waitFor(() => expect(screen.getAllByRole("listitem")).toHaveLength(2))

    await userEvent.click(screen.getAllByRole("button", { name: "Open" })[0])
    await waitFor(() => expect(push).toHaveBeenCalledWith("/en/dashboard/overview"))
  })
})

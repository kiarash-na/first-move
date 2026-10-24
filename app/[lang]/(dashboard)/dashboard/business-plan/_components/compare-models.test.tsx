import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { renderDashboard } from "../../_components/test-utils/render"
import { CompareModels } from "./compare-models"
import { openProject, stopTabs } from "./test-utils/open-project"

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/" }))
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() }, Toaster: () => null }))

afterEach(stopTabs)

describe("CompareModels (D-29)", () => {
  it("explains that a project holds one model and duplicates it to compare", async () => {
    const tab = await openProject({ example: "housing-cooperatives" })
    renderDashboard(<CompareModels />, { store: tab.store })
    expect(screen.getByText(/A project holds one business model/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Duplicate project" }))
    await waitFor(() => expect(tab.store.getState().projects).toHaveLength(2))
    // the copy is stored, the open project stays the same
    expect(tab.store.getState().projects.some((project) => project.name.includes("(copy)"))).toBe(true)
  })

  it("renders nothing without an open project", async () => {
    const tab = await openProject()
    await tab.store.close()
    const { container } = renderDashboard(<CompareModels />, { store: tab.store })
    expect(container).toBeEmptyDOMElement()
  })
})

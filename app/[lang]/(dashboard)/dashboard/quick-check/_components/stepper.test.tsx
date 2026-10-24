import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { renderDashboard } from "../../_components/test-utils/render"
import { emptyProject, exampleProject, projectStore } from "../../_components/test-utils/project-store"
import { Stepper } from "./stepper"

describe("Stepper (QCT-IN-00)", () => {
  it("links every step and the results, marking the current one", () => {
    const { store } = projectStore(exampleProject("school-kindergarten-flats"))
    renderDashboard(<Stepper current="buildings" />, { store })
    const nav = screen.getByRole("navigation", { name: quickCheck.ui.stepper.label })
    const links = Array.from(nav.querySelectorAll("a"))
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      ["area", "buildings", "sources", "options", "results"].map((step) => `/en/dashboard/quick-check/${step}`),
    )
    expect(links[1]).toHaveAttribute("aria-current", "step")
    expect(links.slice(0, 4).every((link) => link.dataset.state === "done")).toBe(true)
  })

  it("marks the steps that miss something", () => {
    const { store } = projectStore(emptyProject())
    renderDashboard(<Stepper current="area" />, { store })
    const links = Array.from(screen.getByRole("navigation").querySelectorAll("a"))
    expect(links.map((link) => link.dataset.state ?? null)).toEqual(["missing", "missing", "missing", "done", null])
    expect(screen.getAllByText(quickCheck.ui.stepper.missing)).toHaveLength(3)
  })

  it("keeps every step at least 44px wide (DESIGN-TOKENS touch target)", () => {
    const { store } = projectStore(emptyProject())
    renderDashboard(<Stepper current="area" />, { store })
    const items = Array.from(screen.getByRole("navigation").querySelectorAll("li"))
    expect(items).toHaveLength(5)
    items.forEach((item) => {
      expect(item.className).toContain("min-w-11")
      expect(item.className).not.toContain("min-w-0")
    })
  })
})

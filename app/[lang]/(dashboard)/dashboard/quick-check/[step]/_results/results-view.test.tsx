import { act, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { renderDashboard } from "../../../_components/test-utils/render"
import { testDictionaries } from "../../../_components/test-utils/dictionaries"
import { emptyProject, exampleProject, projectStore } from "../../../_components/test-utils/project-store"
import { ResultsView } from "./results-view"

vi.mock("next/navigation", () => ({ usePathname: () => "/en/dashboard/quick-check/results", useRouter: () => ({ push: vi.fn() }) }))

describe("ResultsView (PLAN-DASH-08 step 3)", () => {
  it.each(["en", "de"] as const)("switches example 2 to Further analysis with its reason when a source is Unknown (%s)", (lang) => {
    const copy = testDictionaries(lang)["quick-check"]
    const { store, patch } = projectStore(exampleProject("school-kindergarten-flats"))
    const { container } = renderDashboard(<ResultsView />, { store, lang })
    const verdict = () => container.querySelector("[data-slot=verdict-panel]")!
    expect(verdict()).toHaveAttribute("data-level", "promising")
    expect(screen.queryByText(copy.ui.results.unknown.title)).not.toBeInTheDocument()

    act(() => {
      patch({ "sources.potentials.geothermal": "unknown" })
    })
    expect(verdict()).toHaveAttribute("data-level", "further_analysis")
    expect(within(verdict() as HTMLElement).getByText(copy.ui.results.forced)).toBeInTheDocument()
    const reason = container.querySelector("[data-reason=unknown_source]")
    expect(reason).toHaveTextContent(copy.results.reasons.unknown_source.label.replace("{sources}", copy.sources.geothermal.inText))
    expect(screen.getByRole("heading", { name: copy.ui.results.unknown.title })).toBeInTheDocument()
  })

  it("shows every part of a complete result in one view", () => {
    const { store } = projectStore(exampleProject("housing-cooperatives"))
    const { container } = renderDashboard(<ResultsView />, { store })
    for (const slot of ["verdict-panel", "drivers", "coverage", "indicators", "key-figures", "screening-note"]) {
      expect(container.querySelector(`[data-slot=${slot}]`), slot).not.toBeNull()
    }
    expect(container.querySelectorAll("[data-slot=coverage-card]")).toHaveLength(2)
    expect(container.querySelectorAll("[data-slot=indicator-card]")).toHaveLength(4)
    expect(screen.getByText(quickCheck.ui.results.screening.title)).toBeInTheDocument()
  })

  it("explains what is missing without a result", () => {
    const { store } = projectStore(emptyProject())
    const { container } = renderDashboard(<ResultsView />, { store })
    expect(screen.getByRole("heading", { name: quickCheck.ui.results.incomplete.title })).toBeInTheDocument()
    const missing = container.querySelector("[data-slot=results-incomplete]") as HTMLElement
    expect(within(missing).getByRole("link", { name: /Project area/ })).toHaveAttribute("href", "/en/dashboard/quick-check/area")
  })

  it("labels an example's result 'Illustrative inputs only' in the verdict panel (OQ-23)", () => {
    const { store } = projectStore(exampleProject("new-build-quarter"))
    const { container } = renderDashboard(<ResultsView />, { store })
    const verdict = container.querySelector("[data-slot=verdict-panel]") as HTMLElement
    expect(within(verdict).getByText(testDictionaries().shell.illustrative)).toBeInTheDocument()
  })
})

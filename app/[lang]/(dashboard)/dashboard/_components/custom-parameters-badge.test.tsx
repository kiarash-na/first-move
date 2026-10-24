import { act, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { CustomParametersBadge } from "./custom-parameters-badge"
import { renderDashboard } from "./test-utils/render"
import { exampleProject, projectStore } from "./test-utils/project-store"

describe("CustomParametersBadge (D-10)", () => {
  it("appears only while a default is overridden and links to the assumptions", () => {
    const { store, patch } = projectStore(exampleProject("school-kindergarten-flats"))
    renderDashboard(<CustomParametersBadge />, { store })
    expect(screen.queryByText(quickCheck.ui.customParameters.label)).not.toBeInTheDocument()
    act(() => {
      patch({ "quickCheck.overrides.economic.interest_rate": 5 })
    })
    const link = screen.getByRole("link", { name: quickCheck.ui.customParameters.label })
    expect(link).toHaveAttribute("href", "/en/dashboard/assumptions")
    act(() => {
      patch({ "quickCheck.overrides.economic.interest_rate": null })
    })
    expect(screen.queryByText(quickCheck.ui.customParameters.label)).not.toBeInTheDocument()
  })

  it("can be a plain tag", () => {
    const { store } = projectStore(exampleProject("school-kindergarten-flats"))
    store.patch({ "quickCheck.overrides.heating.geothermal.cop": 5 })
    renderDashboard(<CustomParametersBadge linked={false} />, { store })
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
    expect(screen.getByText(quickCheck.ui.customParameters.label)).toBeInTheDocument()
  })
})

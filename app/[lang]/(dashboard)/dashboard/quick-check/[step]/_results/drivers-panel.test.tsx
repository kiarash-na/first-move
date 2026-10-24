import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { run, type QuickCheckComplete } from "@/lib/quick-check"
import { renderDashboard } from "../../../_components/test-utils/render"
import { exampleProject, projectStore } from "../../../_components/test-utils/project-store"
import { DriversPanel } from "./drivers-panel"

describe("DriversPanel (QCT-KF-05)", () => {
  it("lists supporting and limiting factors side by side", () => {
    const project = exampleProject("thermal-spa-hotels")
    const { drivers } = run(project) as QuickCheckComplete
    const { container } = renderDashboard(<DriversPanel drivers={drivers} />, { store: projectStore(project).store })
    expect(container.querySelector("[data-effect=limiting]")).toHaveTextContent("Unknown source potential: geothermal")
    expect(container.querySelector("[data-effect=supporting]")).toHaveTextContent(quickCheck.results.drivers.economics.supporting.label)
  })

  it("says none when a side is empty", () => {
    const project = exampleProject("school-kindergarten-flats")
    const { drivers } = run(project) as QuickCheckComplete
    renderDashboard(<DriversPanel drivers={drivers} />, { store: projectStore(project).store })
    expect(screen.getByText(quickCheck.ui.results.drivers.none)).toBeInTheDocument()
  })
})

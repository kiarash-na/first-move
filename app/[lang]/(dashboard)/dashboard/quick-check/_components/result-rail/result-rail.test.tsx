import { screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { renderDashboard } from "../../../_components/test-utils/render"
import { exampleProject, projectStore } from "../../../_components/test-utils/project-store"
import { ResultRail } from "./result-rail"

describe("ResultRail", () => {
  it("is a labelled complementary region with the live result", () => {
    renderDashboard(<ResultRail />, { store: projectStore(exampleProject("school-kindergarten-flats")).store })
    const rail = screen.getByRole("complementary", { name: quickCheck.ui.rail.title })
    expect(within(rail).getByText(quickCheck.results.levels.promising.label)).toBeInTheDocument()
  })
})

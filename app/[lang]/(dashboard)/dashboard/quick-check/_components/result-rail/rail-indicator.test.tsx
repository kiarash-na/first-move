import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import calc from "@/dictionaries/en/calc.json"
import { RESULT_EXPLAIN } from "@/lib/quick-check"
import { renderDashboard } from "../../../_components/test-utils/render"
import { emptyProject, projectStore } from "../../../_components/test-utils/project-store"
import { RailIndicator } from "./rail-indicator"

describe("RailIndicator", () => {
  it("shows label, value, class, effect and its info popover", () => {
    const { container } = renderDashboard(
      <RailIndicator label="Heat density" value="4.02 MWh/m" detail="High density" effect="supporting" explain={RESULT_EXPLAIN.buildingDensity} />,
      { store: projectStore(emptyProject()).store },
    )
    expect(screen.getByText("4.02 MWh/m")).toBeInTheDocument()
    expect(screen.getByText("High density")).toBeInTheDocument()
    expect(container.querySelector("[data-effect=supporting]")).not.toBeNull()
    expect(screen.getByRole("button", { name: `${calc.ui.info}: Heat density` })).toBeInTheDocument()
  })
})

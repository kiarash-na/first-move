import { screen } from "@testing-library/react"
import { Building2Icon } from "lucide-react"
import { describe, expect, it } from "vitest"
import calc from "@/dictionaries/en/calc.json"
import { RESULT_EXPLAIN } from "@/lib/quick-check"
import { renderDashboard } from "../test-utils/render"
import { emptyProject, projectStore } from "../test-utils/project-store"
import { IndicatorCard } from "./indicator-card"

describe("IndicatorCard (QCT-KF-02)", () => {
  it("shows value, unit, class, meaning, effect and how it is calculated", () => {
    const { container } = renderDashboard(
      <IndicatorCard
        id="buildingDensity"
        icon={Building2Icon}
        title="Building density"
        value="11.1"
        unit="buildings/ha"
        classLabel="Medium density"
        interpretation="The structure may be suitable for a network."
        effect="supporting"
        explain={RESULT_EXPLAIN.buildingDensity}
      >
        Category: Sub-urban
      </IndicatorCard>,
      { store: projectStore(emptyProject()).store },
    )
    expect(screen.getByRole("article", { name: "Building density" })).toHaveTextContent("11.1buildings/ha")
    expect(screen.getByText("Category: Sub-urban")).toBeInTheDocument()
    expect(container.querySelector("[data-effect=supporting]")).not.toBeNull()
    expect(screen.getByRole("button", { name: `${calc.ui.info}: Building density` })).toBeInTheDocument()
  })
})

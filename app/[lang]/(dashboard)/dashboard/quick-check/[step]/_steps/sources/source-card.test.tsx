import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { getField, type ChoiceField } from "@/lib/project"
import { effectiveParameters } from "@/lib/quick-check"
import { renderDashboard } from "../../../../_components/test-utils/render"
import { emptyProject, projectStore } from "../../../../_components/test-utils/project-store"
import { SourceCard } from "./source-card"

describe("SourceCard (QCT-IN-07)", () => {
  it("shows the capacity of the chosen level, including overrides (D-10)", async () => {
    const project = emptyProject()
    const parameters = effectiveParameters({ ...project.quickCheck.overrides, heating: { ...project.quickCheck.overrides.heating, waste_heat: { low: 7000, medium: null, high: null, cop: null } } })
    const { store, current } = projectStore(project)
    renderDashboard(
      <SourceCard field={getField("sources.potentials.waste_heat") as ChoiceField} heating={parameters.heating.waste_heat} cooling={parameters.cooling.waste_heat} />,
      { store },
    )
    expect(screen.getByRole("radiogroup", { name: "Potential of Waste heat" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("radio", { name: "Low" }))
    expect(current().sources.potentials.waste_heat).toBe("low")
    expect(screen.getByText("7 MWh/a")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("radio", { name: "Low" }))
    expect(current().sources.potentials.waste_heat).toBeNull()
  })
})

import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import assumptions from "@/dictionaries/en/assumptions.json"
import { ECONOMIC_PARAMETERS } from "@/lib/project"
import { renderDashboard } from "../test-utils/render"
import { emptyProject, projectStore } from "../test-utils/project-store"
import { EconomicTable } from "./economic-table"

describe("EconomicTable (TBL-6)", () => {
  it("lists every parameter with default and unit, and flags the ambient air cost (OQ-18)", () => {
    const { container } = renderDashboard(<EconomicTable playing={false} />, { store: projectStore(emptyProject()).store })
    expect(container.querySelectorAll("[data-parameter]")).toHaveLength(ECONOMIC_PARAMETERS.length)
    expect(container.querySelector("[data-parameter=heat_pump]")).toHaveTextContent("15,000")
    expect(container.querySelector("[data-parameter=installation_costs_ambient_air]")).toHaveTextContent(assumptions.flags["OQ-18"])
  })

  it("is editable while playing", () => {
    renderDashboard(<EconomicTable playing />, { store: projectStore(emptyProject()).store, lang: "de" })
    expect(screen.getAllByRole("textbox")).toHaveLength(ECONOMIC_PARAMETERS.length)
    expect(screen.getByRole("textbox", { name: "Arbeitspreis Wärme" })).toHaveAttribute("placeholder", "0,12")
  })
})

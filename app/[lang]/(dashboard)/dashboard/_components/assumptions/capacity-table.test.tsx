import { screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import assumptions from "@/dictionaries/en/assumptions.json"
import { renderDashboard } from "../test-utils/render"
import { emptyProject, projectStore } from "../test-utils/project-store"
import { CapacityTable } from "./capacity-table"

describe("CapacityTable (TBL-4/5)", () => {
  it("shows the defaults and the dashes without default (OQ-13)", () => {
    renderDashboard(<CapacityTable application="cooling" playing={false} />, { store: projectStore(emptyProject()).store })
    expect(within(screen.getByRole("row", { name: /Geothermal/ })).getAllByText("10,000")).toHaveLength(1)
    expect(within(screen.getByRole("row", { name: /Waste heat/ })).getAllByText(assumptions.tables.dash)).toHaveLength(4)
  })

  it("offers an input for every cell with a default while playing", () => {
    renderDashboard(<CapacityTable application="heating" playing />, { store: projectStore(emptyProject()).store })
    expect(screen.getAllByRole("textbox")).toHaveLength(23)
    expect(screen.getByRole("textbox", { name: "TBL-4 Solar thermal, High" })).toHaveAttribute("placeholder", "50,000")
  })
})

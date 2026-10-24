import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { costStructure, economicsData, supplyBySource } from "@/lib/dashboard/overview"
import { formatEnergy, formatEur } from "@/lib/i18n/format"
import { completeRun, exampleWith, renderOverview } from "../test-utils/overview-render"
import { ChartsSection } from "./charts-section"

const flat = (text: string | null) => (text ?? "").replace(/\s/g, " ")

function setup(id = "school-kindergarten-flats", lang: "en" | "de" = "en") {
  const project = exampleWith(id)
  const result = completeRun(project)
  return { result, user: userEvent.setup(), ...renderOverview(<ChartsSection result={result} />, project, lang) }
}

describe("ChartsSection", () => {
  it("shows the three default charts and none of the on-click charts", () => {
    setup()
    for (const id of ["chart-coverage", "chart-economics", "chart-investment"]) expect(document.getElementById(id)).not.toBeNull()
    for (const id of ["chart-demand", "chart-supply", "chart-cost"]) expect(document.getElementById(id)).toBeNull()
  })

  it("draws the coverage bullet bars for heating and cooling from run()", () => {
    const { result } = setup()
    const card = document.getElementById("chart-coverage")!
    expect(card.querySelectorAll("[data-slot=bullet-bar]")).toHaveLength(2)
    expect(flat(card.textContent)).toContain(flat(formatEnergy(result.values.heatingSupplyKwh, "en", { perYear: true })))
  })

  it.each(["chart-coverage", "chart-economics", "chart-investment"])("gives %s a table view with the same numbers", async (id) => {
    const { user, result } = setup()
    const card = document.getElementById(id)!
    await user.click(within(card).getByRole("radio", { name: "Table" }))
    const table = within(card).getByRole("table")
    expect(table).toBeInTheDocument()
    const text = flat(table.textContent)
    if (id === "chart-economics") {
      const data = economicsData(result)
      expect(text).toContain(flat(formatEur(data.revenueTotal, "en")))
      expect(text).toContain(flat(formatEur(data.costTotal, "en")))
    }
    if (id === "chart-investment") expect(text).toContain(flat(formatEur(result.values.overallInvestment, "en")))
    if (id === "chart-coverage") expect(text).toContain(flat(formatEnergy(result.values.heatingDemandKwh, "en", { perYear: true })))
  })

  it("loads each on-click chart only when its button is pressed, then offers its table", async () => {
    const { user, result } = setup()
    const group = screen.getByRole("radiogroup", { name: "More charts" })

    await user.click(within(group).getByRole("radio", { name: "Demand by type and period" }))
    const demand = await waitFor(() => {
      const element = document.getElementById("chart-demand")
      expect(element).not.toBeNull()
      return element!
    })
    expect(document.getElementById("chart-supply")).toBeNull()
    await user.click(within(demand).getByRole("radio", { name: "Table" }))
    expect(within(demand).getAllByRole("table")).toHaveLength(2)

    await user.click(within(group).getByRole("radio", { name: "Supply per source" }))
    const supply = await waitFor(() => {
      const element = document.getElementById("chart-supply")
      expect(element).not.toBeNull()
      return element!
    })
    expect(document.getElementById("chart-demand")).toBeNull()
    await user.click(within(supply).getByRole("radio", { name: "Table" }))
    const data = supplyBySource(result)
    expect(flat(within(supply).getByRole("table").textContent)).toContain(flat(formatEnergy(data.heatingDemandKwh, "en", { perYear: true })))

    await user.click(within(group).getByRole("radio", { name: "Cost structure" }))
    const cost = await waitFor(() => {
      const element = document.getElementById("chart-cost")
      expect(element).not.toBeNull()
      return element!
    })
    await user.click(within(cost).getByRole("radio", { name: "Table" }))
    expect(within(cost).getAllByRole("table")).toHaveLength(2)
    expect(flat(cost.textContent)).toContain(flat(formatEur(costStructure(result).investment[0].value, "en")))
  })

  it("hides the on-click chart again when its button is pressed twice", async () => {
    const { user } = setup()
    const button = screen.getByRole("radio", { name: "Cost structure" })
    await user.click(button)
    await waitFor(() => expect(document.getElementById("chart-cost")).not.toBeNull())
    await user.click(button)
    expect(document.getElementById("chart-cost")).toBeNull()
  })

  it("works in German with English fallbacks", () => {
    setup("housing-cooperatives", "de")
    expect(document.getElementById("chart-coverage")).not.toBeNull()
  })
})

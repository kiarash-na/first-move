import { within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { EXAMPLES } from "@/lib/examples"
import { formatEur, formatNumber, formatQuantity } from "@/lib/i18n/format"
import { completeRun, exampleWith, renderOverview } from "../test-utils/overview-render"
import { TileGrid } from "./tile-grid"

const tile = (id: string) => document.querySelector(`[data-tile="${id}"]`) as HTMLElement
const flat = (text: string | null) => (text ?? "").replace(/\s/g, " ")

describe.each(EXAMPLES.map((example) => example.id))("TileGrid of %s", (id) => {
  it("shows the secondary numbers of run() with an info popover each", () => {
    const project = exampleWith(id)
    const result = completeRun(project)
    const { values } = result
    renderOverview(<TileGrid result={result} />, project)

    expect(document.querySelectorAll("[data-slot=metric-tile]")).toHaveLength(8)
    expect(flat(tile("buildingDensity").textContent)).toContain(formatNumber(values.buildingDensity, "en", { maximumFractionDigits: 1 }))
    expect(flat(tile("heatDensity").textContent)).toContain(formatNumber(values.heatDensityMwhPerM, "en", { maximumFractionDigits: 2 }))
    expect(flat(tile("networkLength").textContent)).toContain(flat(formatQuantity(values.networkLengthM, "m", "en", { maximumFractionDigits: 0 })).replace(" m", ""))
    expect(flat(tile("electricity").textContent)).toContain(flat(formatEur(values.electricityCosts, "en", { compact: true })))
    expect(flat(tile("operation").textContent)).toContain(flat(formatEur(values.operationAndMaintenance, "en", { compact: true })))
    expect(flat(tile("annuity").textContent)).toContain(flat(formatEur(values.annualizedCosts, "en", { compact: true })))
    for (const element of document.querySelectorAll("[data-slot=metric-tile]")) {
      expect(within(element as HTMLElement).getByRole("button", { name: /How we calculate this/ })).toBeInTheDocument()
    }
  })
})

describe("TileGrid", () => {
  it("uses one column below 360px so two tiles never overflow a 320px screen", () => {
    const project = exampleWith("housing-cooperatives")
    renderOverview(<TileGrid result={completeRun(project)} />, project)
    const grid = tile("operation").parentElement as HTMLElement
    expect(grid).toHaveClass("grid-cols-1", "min-[360px]:grid-cols-2")
  })

  it("says whether the network length was entered or estimated (KF-07)", () => {
    const entered = exampleWith("rural-village-hotel")
    const view = renderOverview(<TileGrid result={completeRun(entered)} />, entered)
    expect(tile("networkLength")).toHaveTextContent("Entered")
    view.unmount()
    const estimated = exampleWith("school-kindergarten-flats")
    renderOverview(<TileGrid result={completeRun(estimated)} />, estimated)
    expect(tile("networkLength")).toHaveTextContent("Estimated")
  })

  it("names the class of the densities", () => {
    const project = exampleWith("school-kindergarten-flats")
    renderOverview(<TileGrid result={completeRun(project)} />, project)
    expect(tile("buildingDensity")).toHaveTextContent(/density/i)
    expect(tile("chRatio")).toHaveTextContent(/balanced/i)
  })
})

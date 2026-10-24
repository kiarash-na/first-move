import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { EXAMPLES } from "@/lib/examples"
import { formatEnergy, formatEur, formatPercent } from "@/lib/i18n/format"
import { splitUnit } from "@/lib/dashboard/overview"
import { completeRun, exampleWith, renderOverview } from "../test-utils/overview-render"
import { KpiGrid } from "./kpi-grid"

const card = (id: string) => document.querySelector(`[data-kpi="${id}"]`) as HTMLElement

describe.each(EXAMPLES.map((example) => example.id))("KpiGrid of %s", (id) => {
  it.each(["en", "de"] as const)("shows the numbers of run() in %s", (lang) => {
    const project = exampleWith(id)
    const result = completeRun(project)
    const { values } = result
    renderOverview(<KpiGrid result={result} />, project, lang)

    const text = (key: string) => card(key).textContent!.replace(/\s/g, " ")
    const heatingCoverage = formatPercent(values.heatingCoverage, lang)
    expect(text("heatingCoverage")).toContain(heatingCoverage.replace(/\s/g, " "))
    expect(text("coolingCoverage")).toContain(formatPercent(values.coolingCoverage, lang).replace(/\s/g, " "))
    const { number, unit } = splitUnit(formatEnergy(values.heatingDemandKwh, lang, { perYear: true }))
    expect(text("heatingDemand")).toContain(number)
    expect(text("heatingDemand")).toContain(unit)
    expect(text("coolingDemand")).toContain(splitUnit(formatEnergy(values.coolingDemandKwh, lang, { perYear: true })).number)
    expect(text("revenue")).toContain(formatEur(values.overallRevenue, lang, { compact: true }).replace(/\s/g, " "))
    expect(text("investment")).toContain(formatEur(values.overallInvestment, lang, { compact: true }).replace(/\s/g, " "))
    expect(text("annualCosts")).toContain(formatEur(values.annualCosts, lang, { compact: true }).replace(/\s/g, " "))
  })

  it("gives every card an info popover (D-33)", () => {
    const project = exampleWith(id)
    renderOverview(<KpiGrid result={completeRun(project)} />, project)
    const cards = document.querySelectorAll("[data-slot=kpi-card]")
    expect(cards).toHaveLength(7)
    for (const element of cards) expect(within(element as HTMLElement).getByRole("button", { name: /How we calculate this/ })).toBeInTheDocument()
  })
})

describe("KpiGrid", () => {
  it("opens the formula of a number with its id", async () => {
    const user = userEvent.setup()
    const project = exampleWith("school-kindergarten-flats")
    renderOverview(<KpiGrid result={completeRun(project)} />, project)
    await user.click(within(card("revenue")).getByRole("button", { name: /How we calculate this: Overall revenues/ }))
    expect(await screen.findByText("EQ-3.9c")).toBeInTheDocument()
  })

  it("marks a demand that is not relevant", () => {
    const project = exampleWith("school-kindergarten-flats", { "quickCheck.manualDemand.coolingKwhPerYear": 0 })
    const result = completeRun(project)
    expect(result.values.coolingCoverage).toBeNull()
    renderOverview(<KpiGrid result={result} />, project)
    expect(card("coolingCoverage")).toHaveTextContent("Not relevant")
  })

  it("names an entered demand", () => {
    const project = exampleWith("school-kindergarten-flats", { "quickCheck.manualDemand.heatingKwhPerYear": 500_000 })
    renderOverview(<KpiGrid result={completeRun(project)} />, project)
    expect(card("heatingDemand")).toHaveTextContent("Entered demand")
  })
})

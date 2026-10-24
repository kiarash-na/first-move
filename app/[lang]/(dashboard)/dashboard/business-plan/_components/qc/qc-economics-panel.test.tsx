import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { formatEur } from "@/lib/i18n/format"
import { run } from "@/lib/quick-check"
import { renderDashboard } from "../../../_components/test-utils/render"
import { openProject, stopTabs } from "../test-utils/open-project"
import { QcEconomicsPanel } from "./qc-economics-panel"

afterEach(stopTabs)

/** Number formats use no-break spaces; the DOM matcher compares normal ones. */
const spaces = (text: string) => text.replace(/\s/g, " ")

describe("QcEconomicsPanel (ALG-09, D-27)", () => {
  it.each(["en", "de"] as const)("shows revenue and investment from the engine, read-only (%s)", async (lang) => {
    const tab = await openProject({ example: "school-kindergarten-flats" })
    renderDashboard(<QcEconomicsPanel />, { store: tab.store, lang })
    const result = run(tab.store.getState().active!)
    if (result.status !== "complete") throw new Error("expected a result")
    const region = screen.getByRole("region", { name: "From the Quick Check" })
    expect(region).toHaveTextContent(spaces(formatEur(result.values.overallRevenue, lang, { compact: true })))
    expect(region).toHaveTextContent(spaces(formatEur(result.values.overallInvestment, lang, { compact: true })))
    expect(region.querySelectorAll("input, textarea")).toHaveLength(0)
  })

  it("follows the Quick Check inputs, never its own maths", async () => {
    const tab = await openProject({ example: "school-kindergarten-flats" })
    renderDashboard(<QcEconomicsPanel />, { store: tab.store })
    const before = screen.getByRole("region").textContent
    tab.store.patch({ "buildings.total": 30 })
    const result = run(tab.store.getState().active!)
    if (result.status !== "complete") throw new Error("expected a result")
    expect(await screen.findByText(formatEur(result.values.overallInvestment, "en", { compact: true }))).toBeInTheDocument()
    expect(screen.getByRole("region").textContent).not.toBe(before)
  })

  it("explains the numbers on request and flags custom parameters (D-10, D-33)", async () => {
    const tab = await openProject({ example: "school-kindergarten-flats" })
    tab.store.patch({ "quickCheck.overrides.economic.heating_base_price": 99 })
    renderDashboard(<QcEconomicsPanel />, { store: tab.store })
    expect(screen.getByText("Custom parameters")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: /How we calculate this: Overall investment/ }))
    expect(await screen.findByText("EQ-3.10a")).toBeInTheDocument()
  })

  it("links to the Quick Check when the module is off", async () => {
    const tab = await openProject({ example: "school-kindergarten-flats" })
    tab.store.patch({ "meta.modules.quickCheck": false })
    renderDashboard(<QcEconomicsPanel />, { store: tab.store })
    expect(screen.getByRole("link", { name: /Open Quick Check/ })).toHaveAttribute("href", "/en/dashboard/quick-check/area")
    expect(screen.queryByText("Revenue")).toBeNull()
  })

  it("is incomplete without Quick Check inputs", async () => {
    const tab = await openProject({ modules: { quickCheck: true, businessPlan: true } })
    renderDashboard(<QcEconomicsPanel />, { store: tab.store })
    expect(screen.getByText("The Quick Check is not complete yet")).toBeInTheDocument()
  })
})

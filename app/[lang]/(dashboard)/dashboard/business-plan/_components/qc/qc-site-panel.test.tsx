import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { run } from "@/lib/quick-check"
import { formatEnergy } from "@/lib/i18n/format"
import { renderDashboard } from "../../../_components/test-utils/render"
import { openProject, stopTabs } from "../test-utils/open-project"
import { QcSitePanel } from "./qc-site-panel"

afterEach(stopTabs)

/** Number formats use no-break spaces; the DOM matcher compares normal ones. */
const spaces = (text: string) => text.replace(/\s/g, " ")

describe("QcSitePanel (ALG-09)", () => {
  it.each(["en", "de"] as const)("shows shared site data and the Quick Check demand read-only (%s)", async (lang) => {
    const tab = await openProject({ example: "housing-cooperatives" })
    renderDashboard(<QcSitePanel />, { store: tab.store, lang })
    const result = run(tab.store.getState().active!)
    if (result.status !== "complete") throw new Error("expected a result")
    const region = screen.getByRole("region", { name: "From the Quick Check" })
    expect(region).toHaveTextContent(spaces(formatEnergy(result.values.heatingDemandKwh, lang, { perYear: true })))
    expect(region).toHaveTextContent(spaces(formatEnergy(result.values.coolingDemandKwh, lang, { perYear: true })))
    expect(region).toHaveTextContent("Read-only")
    // no input in the panel: nothing to change here
    expect(region.querySelectorAll("input, textarea")).toHaveLength(0)
    // each number carries the "How we calculate" popover (D-33)
    expect(screen.getByRole("button", { name: /How we calculate this: Heating demand/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /How we calculate this: Cooling demand/ })).toBeInTheDocument()
  })

  it("opens the explanation with the equation and its ID", async () => {
    const tab = await openProject({ example: "housing-cooperatives" })
    renderDashboard(<QcSitePanel />, { store: tab.store })
    await userEvent.click(screen.getByRole("button", { name: /How we calculate this: Heating demand/ }))
    expect(await screen.findByText("EQ-3.2a")).toBeInTheDocument()
  })

  it("adds the screened sources to the heat sources text, once", async () => {
    const tab = await openProject({ example: "housing-cooperatives" })
    tab.store.patch({ "businessPlan.opportunity.heatSources": "Own notes." })
    renderDashboard(<QcSitePanel />, { store: tab.store })
    await userEvent.click(screen.getByRole("button", { name: "Add to heat sources" }))
    const text = tab.store.getState().active!.businessPlan.opportunity.heatSources
    expect(text.startsWith("Own notes.\nSources screened in the Quick Check: ")).toBe(true)
    expect(screen.getByRole("button", { name: "Added to the heat sources text." })).toBeDisabled()
  })

  it("links to the Quick Check when the module is off, with no numbers", async () => {
    const tab = await openProject({ example: "housing-cooperatives" })
    tab.store.patch({ "meta.modules.quickCheck": false })
    renderDashboard(<QcSitePanel />, { store: tab.store, lang: "de" })
    expect(screen.getByText("The Quick Check is off for this project")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Open Quick Check/ })).toHaveAttribute("href", "/de/dashboard/quick-check/area")
    expect(screen.queryByText("Heating demand")).toBeNull()
  })

  it("points at the step to finish when the Quick Check is incomplete, and still shows the shared inputs", async () => {
    const tab = await openProject({ modules: { quickCheck: true, businessPlan: true } })
    tab.store.patch({ "buildings.total": 12 })
    renderDashboard(<QcSitePanel />, { store: tab.store })
    expect(screen.getByText("The Quick Check is not complete yet")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Continue Quick Check/ })).toHaveAttribute("href", expect.stringMatching(/\/en\/dashboard\/quick-check\/(area|buildings|sources)$/))
    expect(screen.getByText("12")).toBeInTheDocument()
    expect(screen.getByText("None selected yet")).toBeInTheDocument()
  })
})

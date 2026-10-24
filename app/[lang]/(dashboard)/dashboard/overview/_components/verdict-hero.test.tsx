import { screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { completeRun, exampleWith, renderOverview } from "./test-utils/overview-render"
import { VerdictHero } from "./verdict-hero"

describe("VerdictHero", () => {
  it.each([
    ["school-kindergarten-flats", "promising", "Promising"],
    ["rural-village-hotel", "not_promising", "Not promising"],
    ["housing-cooperatives", "further_analysis", "Further analysis required"],
  ] as const)("shows the verdict of %s with its icon, text and drivers", (id, level, label) => {
    const project = exampleWith(id)
    const result = completeRun(project)
    renderOverview(<VerdictHero result={result} />, project)
    const hero = screen.getByRole("region", { name: label })
    expect(hero).toHaveAttribute("data-level", level)
    expect(within(hero).getByRole("heading", { name: label })).toBeInTheDocument()
    expect(within(hero).getByRole("link", { name: /see why/i })).toHaveAttribute("href", "/en/dashboard/quick-check/results")
    const supporting = hero.querySelector('[data-effect="supporting"]')!
    const limiting = hero.querySelector('[data-effect="limiting"]')!
    expect(within(supporting as HTMLElement).queryAllByRole("listitem")).toHaveLength(result.drivers.supporting.length)
    expect(within(limiting as HTMLElement).queryAllByRole("listitem")).toHaveLength(result.drivers.limiting.length)
  })

  it("says when a fixed rule forced the verdict", () => {
    const project = exampleWith("thermal-spa-hotels")
    renderOverview(<VerdictHero result={completeRun(project)} />, project)
    expect(screen.getByText("Set by a fixed rule")).toBeInTheDocument()
  })

  it("has the info popover for the level", () => {
    const project = exampleWith("school-kindergarten-flats")
    renderOverview(<VerdictHero result={completeRun(project)} />, project)
    expect(screen.getByRole("button", { name: /How we calculate this: Quick Check verdict/ })).toBeInTheDocument()
  })

  it("is German on the German route", () => {
    const project = exampleWith("school-kindergarten-flats")
    renderOverview(<VerdictHero result={completeRun(project)} />, project, "de")
    expect(screen.getByRole("link", { name: /Begründung ansehen/ })).toHaveAttribute("href", "/de/dashboard/quick-check/results")
  })
})

import { screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { allProgress, overallProgress, pitchReadiness } from "@/lib/business-plan"
import { topRisks } from "@/lib/dashboard/overview"
import { formatPercent } from "@/lib/i18n/format"
import { EXAMPLES } from "@/lib/examples"
import { exampleWith, renderOverview } from "../test-utils/overview-render"
import { BusinessPlanSection } from "./business-plan-section"

const tile = (id: string) => document.querySelector(`[data-tile="${id}"]`) as HTMLElement

describe("BusinessPlanSection", () => {
  it.each(EXAMPLES.map((example) => example.id))("shows progress, readiness, risks and the deal-breaker of %s", (id) => {
    const project = exampleWith(id)
    renderOverview(<BusinessPlanSection project={project} />, project)
    expect(screen.getByRole("heading", { name: "Business Plan" })).toBeInTheDocument()

    const steps = tile("steps")
    expect(steps).toHaveTextContent(formatPercent(overallProgress(allProgress(project)), "en"))
    expect(within(steps).getAllByRole("link")).toHaveLength(4)
    expect(within(steps).getByRole("link", { name: /Reality check/ })).toHaveAttribute("href", "/en/dashboard/business-plan/reality-check")

    const readiness = pitchReadiness(project)
    expect(tile("readiness")).toHaveTextContent(formatPercent(readiness.score, "en"))
    expect(within(tile("readiness")).getByRole("link")).toHaveAttribute("href", "/en/dashboard/business-plan/implementation#readiness")

    const risks = topRisks(project, 3)
    expect(within(tile("risks")).getAllByRole("listitem")).toHaveLength(risks.length)
    expect(tile("risks")).toHaveTextContent("Deal-breaker")
    expect(tile("dealBreaker")).toHaveTextContent(risks[0].title)
  })

  it("puts the AI Plan Score first, as a bolder strip before the completeness (D-74)", () => {
    const project = exampleWith("housing-cooperatives")
    renderOverview(<BusinessPlanSection project={project} />, project)
    expect(tile("aiScore")).toHaveTextContent("AI Plan Score")
    expect(tile("aiScore").compareDocumentPosition(tile("readiness")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(tile("readiness")).toHaveTextContent("Pitch completeness")
  })

  it("nudges when nothing is entered yet", () => {
    const project = exampleWith("school-kindergarten-flats", { "businessPlan.risks": [] })
    renderOverview(<BusinessPlanSection project={project} />, project)
    expect(tile("risks")).toHaveTextContent("No risks entered yet.")
    expect(within(tile("risks")).getByRole("link", { name: "Add risks" })).toBeInTheDocument()
    expect(tile("dealBreaker")).toHaveTextContent("No deal-breaker marked yet.")
    expect(within(tile("dealBreaker")).getByRole("link", { name: "Mark one" })).toBeInTheDocument()
  })

  it("follows the German route", () => {
    const project = exampleWith("school-kindergarten-flats")
    renderOverview(<BusinessPlanSection project={project} />, project, "de")
    expect(within(tile("steps")).getByRole("link", { name: /Realitätscheck/ })).toHaveAttribute("href", "/de/dashboard/business-plan/reality-check")
  })
})

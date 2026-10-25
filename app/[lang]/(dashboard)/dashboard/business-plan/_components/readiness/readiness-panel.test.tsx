import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { JURY_CRITERIA, PITCH_SECTIONS } from "@/lib/business-plan"
import { renderDashboard } from "../../../_components/test-utils/render"
import { testAiScore } from "../test-utils/ai-score"
import { openProject, stopTabs } from "../test-utils/open-project"
import { ReadinessPanel } from "./readiness-panel"

afterEach(stopTabs)

describe("ReadinessPanel (D-30)", () => {
  it("shows the six pitch parts and the five V01 jury criteria, labelled unofficial", async () => {
    const tab = await openProject()
    renderDashboard(<ReadinessPanel index={4} />, { store: tab.store })
    const sections = screen.getByRole("region", { name: /The six parts of the final pitch/ })
    expect(within(sections).getAllByRole("article")).toHaveLength(PITCH_SECTIONS.length)
    const jury = screen.getByRole("region", { name: /Jury criteria/ })
    expect(within(jury).getAllByRole("article")).toHaveLength(JURY_CRITERIA.length)
    expect(within(jury).getAllByText("Unofficial").length).toBeGreaterThan(JURY_CRITERIA.length)
    expect(jury).toHaveTextContent("not an official scoring rule")
    expect(screen.getByText("Not started")).toBeInTheDocument()
  })

  it("covers a check as soon as its field is filled, with icon and text", async () => {
    const tab = await openProject()
    renderDashboard(<ReadinessPanel />, { store: tab.store })
    const part = screen.getByRole("article", { name: "Scalability and replicability" })
    expect(within(part).getAllByText(/^Open:/)).toHaveLength(3)
    tab.store.patch({ "businessPlan.scalability.geographical": "Other valleys" })
    await waitFor(() => expect(within(part).getAllByText(/^Open:/)).toHaveLength(2))
    expect(within(part).getByText(/^Covered:/).closest("li")).toHaveTextContent("Geographical conditions")
    expect(within(part).getByText(/1\/3/)).toBeInTheDocument()
  })

  it("links an open check to the step where it is filled in", async () => {
    const tab = await openProject()
    renderDashboard(<ReadinessPanel />, { store: tab.store, lang: "de" })
    const part = screen.getByRole("article", { name: "Nächste Schritte" })
    const links = within(part).getAllByRole("link")
    expect(links[0]).toHaveAttribute("href", "/de/dashboard/business-plan/implementation")
    expect(links[0]).toHaveAccessibleName("Ausfüllen: Zu erhebende Daten")
  })

  it("reaches 100% and complete when the Business Plan is complete (Example 3)", async () => {
    const tab = await openProject({ example: "housing-cooperatives" })
    renderDashboard(<ReadinessPanel />, { store: tab.store })
    expect(screen.getAllByText("100%").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Complete").length).toBeGreaterThan(PITCH_SECTIONS.length)
    expect(screen.queryByRole("link", { name: /^Fill in/ })).toBeNull()
  })

  it("explains how completeness is counted, collapsed by default (D-33)", async () => {
    const tab = await openProject()
    renderDashboard(<ReadinessPanel />, { store: tab.store })
    const toggle = screen.getByRole("button", { name: /How completeness is counted/ })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(toggle)
    expect(screen.getByText(/There is no equation behind this/)).toBeInTheDocument()
  })

  it("opens with the AI Plan Score, bolder and before the completeness, with its caveat and how it is made (D-74)", async () => {
    const tab = await openProject()
    renderDashboard(<ReadinessPanel />, { store: tab.store })
    const badge = screen.getByRole("link", { name: /Get an AI Plan Score/ })
    const completeness = screen.getByRole("progressbar", { name: "Pitch completeness" })
    expect(badge.compareDocumentPosition(completeness) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByText(/not a calculation and not a feasibility verdict/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /How the AI Plan Score is made/ })).toHaveAttribute("aria-expanded", "false")
  })

  it("shows a saved score at the top of the panel", async () => {
    const tab = await openProject()
    const project = tab.store.getState().active!
    tab.store.setAiScore(project.meta.id, testAiScore(project))
    renderDashboard(<ReadinessPanel />, { store: tab.store })
    const badge = screen.getByRole("link", { name: /AI Plan Score/ })
    expect(badge).toHaveAttribute("data-state", "current")
    expect(badge).toHaveTextContent("60")
    expect(badge).toHaveTextContent("Promising")
  })
})

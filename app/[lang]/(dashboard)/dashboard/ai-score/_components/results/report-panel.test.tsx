import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { ReportPanel } from "./report-panel"
import { report } from "./test-utils/fixtures"
import { aiScoreCopy, mockActions, renderResults } from "./test-utils/render"

const copy = aiScoreCopy("en")
const text = copy.results.report

describe("ReportPanel", () => {
  it("shows the report as AI output with its model, and chips to the parts it points to", () => {
    const saved = report("en")
    const { container } = renderResults(<ReportPanel report={saved} actions={mockActions()} error={null} />)
    expect(screen.getByText(saved.headline)).toBeInTheDocument()
    expect(screen.getByText(saved.summary)).toBeInTheDocument()
    expect(screen.getByText("Written by provider/text-model")).toBeInTheDocument()
    expect(container.querySelector("article")).toHaveAttribute("data-ai-generated", "true")
    const strengths = screen.getByRole("region", { name: text.strengths })
    expect(within(strengths).getByRole("link", { name: copy.labels.judgements.site })).toHaveAttribute("href", "#ai-score-part-site")
    expect(within(strengths).getByRole("link", { name: copy.labels.gates.anchor.name })).toHaveAttribute("href", "#ai-score-check-anchor")
    const gaps = screen.getByRole("region", { name: text.gaps })
    // The unknown key is dropped.
    expect(within(gaps).getAllByRole("link")).toHaveLength(2)
    expect(within(screen.getByRole("region", { name: text.actions })).getByText(saved.actions[0])).toBeInTheDocument()
    expect(container.querySelector("[data-slot=report-panel]")).toHaveAttribute("data-state", "current")
  })

  it("writes the report again on request", async () => {
    const actions = mockActions()
    renderResults(<ReportPanel report={report("en")} actions={actions} error={null} />)
    await userEvent.click(screen.getByRole("button", { name: text.rewrite }))
    expect(actions.rewriteReport).toHaveBeenCalledTimes(1)
  })

  it("offers to write a missing report", async () => {
    const actions = mockActions()
    const { container } = renderResults(<ReportPanel report={null} actions={actions} error={null} />)
    expect(screen.getByText(text.none)).toBeInTheDocument()
    expect(container.querySelector("[data-slot=report-panel]")).toHaveAttribute("data-state", "none")
    await userEvent.click(screen.getByRole("button", { name: text.write }))
    expect(actions.rewriteReport).toHaveBeenCalledTimes(1)
  })

  it("marks a report in the other language and offers it in the page language", () => {
    const { container } = renderResults(<ReportPanel report={report("de")} actions={mockActions()} error={null} />)
    expect(screen.getByText("This report is in German.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Write it in English" })).toBeEnabled()
    expect(container.querySelector("article")).toHaveAttribute("lang", "de")
    expect(container.querySelector("[data-slot=report-panel]")).toHaveAttribute("data-state", "other-language")
  })

  it("is disabled with a hint while no key or text model is ready", () => {
    renderResults(<ReportPanel report={null} actions={mockActions({ canUseAi: false })} error={null} />)
    expect(screen.getByRole("button", { name: text.write })).toBeDisabled()
    expect(screen.getByText(copy.results.needsAi)).toBeInTheDocument()
  })

  it("shows that the report is being written", () => {
    renderResults(<ReportPanel report={report("en")} actions={mockActions({ busy: "report" })} error={null} />)
    const button = screen.getByRole("button", { name: text.writing })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute("aria-busy", "true")
  })

  it("shows the error of a failed request as plain copy", () => {
    renderResults(<ReportPanel report={null} actions={mockActions({ error: "credits" })} error="credits" />, { lang: "de" })
    expect(screen.getByRole("alert")).toHaveTextContent(aiScoreCopy("de").results.errors.credits)
  })
})

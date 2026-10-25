import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { ReportPanel } from "./report-panel"
import { report } from "./test-utils/fixtures"
import { aiScoreCopy, mockActions, renderResults } from "./test-utils/render"

const copy = aiScoreCopy("en")
const text = copy.results.report
/** The rows the fixture report points to; its "unknown-key" has none. */
const ROWS: ReadonlySet<string> = new Set(["site", "anchor", "operator", "pain-point"])

describe("ReportPanel", () => {
  it("shows the report as AI output with its model, and chips to the parts it points to", () => {
    const saved = report("en")
    const { container } = renderResults(<ReportPanel report={saved} rows={ROWS} actions={mockActions()} error={null} />)
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
    renderResults(<ReportPanel report={report("en")} rows={ROWS} actions={actions} error={null} />)
    await userEvent.click(screen.getByRole("button", { name: text.rewrite }))
    expect(actions.rewriteReport).toHaveBeenCalledTimes(1)
  })

  it("offers to write a missing report", async () => {
    const actions = mockActions()
    const { container } = renderResults(<ReportPanel report={null} rows={ROWS} actions={actions} error={null} />)
    expect(screen.getByText(text.none)).toBeInTheDocument()
    expect(container.querySelector("[data-slot=report-panel]")).toHaveAttribute("data-state", "none")
    await userEvent.click(screen.getByRole("button", { name: text.write }))
    expect(actions.rewriteReport).toHaveBeenCalledTimes(1)
  })

  it("marks a report in the other language and offers it in the page language", () => {
    const { container } = renderResults(<ReportPanel report={report("de")} rows={ROWS} actions={mockActions()} error={null} />)
    expect(screen.getByText("This report is in German.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Write it in English" })).toBeEnabled()
    expect(container.querySelector("article")).toHaveAttribute("lang", "de")
    expect(container.querySelector("[data-slot=report-panel]")).toHaveAttribute("data-state", "other-language")
  })

  it("keeps the page language for the badge, the by-line and the chips of a report in the other language", () => {
    const { container } = renderResults(<ReportPanel report={report("de")} rows={ROWS} actions={mockActions()} error={null} />)
    expect(screen.getByText(copy.results.aiGenerated).closest("[lang]")).toHaveAttribute("lang", "en")
    expect(screen.getByText("Written by provider/text-model").closest("[lang]")).toHaveAttribute("lang", "en")
    for (const list of container.querySelectorAll("[data-slot=key-chips]")) expect(list).toHaveAttribute("lang", "en")
  })

  it("points only to rows of this run and lists repeated texts each time", () => {
    const repeated = "Name the operator."
    const saved = report("en", { gaps: [{ text: repeated, keys: ["operator", "anchor-public"] }, { text: repeated, keys: [] }], actions: [repeated, repeated] })
    renderResults(<ReportPanel report={saved} rows={ROWS} actions={mockActions()} error={null} />)
    const gaps = screen.getByRole("region", { name: text.gaps })
    expect(within(gaps).getAllByText(repeated)).toHaveLength(2)
    expect(within(gaps).getAllByRole("link")).toHaveLength(1)
    expect(within(screen.getByRole("region", { name: text.actions })).getAllByText(repeated)).toHaveLength(2)
  })

  it("is disabled with a hint while no key or text model is ready", () => {
    renderResults(<ReportPanel report={null} rows={ROWS} actions={mockActions({ canUseAi: false })} error={null} />)
    expect(screen.getByRole("button", { name: text.write })).toBeDisabled()
    expect(screen.getByText(copy.results.needsAi)).toBeInTheDocument()
  })

  it("is disabled during a run and says so, instead of asking for a key", () => {
    renderResults(<ReportPanel report={report("en")} rows={ROWS} actions={mockActions({ canUseAi: false, running: true })} error={null} />)
    expect(screen.getByRole("button", { name: text.rewrite })).toBeDisabled()
    expect(screen.getByText(copy.results.runInProgress)).toBeInTheDocument()
    expect(screen.queryByText(copy.results.needsAi)).not.toBeInTheDocument()
  })

  it("shows that the report is being written", () => {
    renderResults(<ReportPanel report={report("en")} rows={ROWS} actions={mockActions({ busy: "report" })} error={null} />)
    const button = screen.getByRole("button", { name: text.writing })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute("aria-busy", "true")
  })

  it("shows the error of a failed request as plain copy", () => {
    renderResults(<ReportPanel report={null} rows={ROWS} actions={mockActions({ error: "credits" })} error="credits" />, { lang: "de" })
    expect(screen.getByRole("alert")).toHaveTextContent(aiScoreCopy("de").results.errors.credits)
  })
})

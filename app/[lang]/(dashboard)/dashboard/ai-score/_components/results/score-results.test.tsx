import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it } from "vitest"
import { aiScoreStatus, displayScore } from "@/lib/business-plan"
import { applyPatch } from "@/lib/project"
import type { ResultActions } from "../types"
import { ScoreResults } from "./score-results"
import { CAPPED, report, scored, suggestions, withText, type Scored } from "./test-utils/fixtures"
import { aiScoreCopy, mockActions, renderResults } from "./test-utils/render"

let varied: Scored
let capped: Scored
beforeAll(async () => {
  ;[varied, capped] = await Promise.all([scored(), scored(CAPPED)])
})

const copy = aiScoreCopy("en")

function renderScore(fixture: Scored, options: { changed?: string[]; actions?: ResultActions; lang?: "en" | "de"; score?: Scored["score"] } = {}) {
  const actions = options.actions ?? mockActions()
  const view = renderResults(<ScoreResults project={fixture.project} score={options.score ?? fixture.score} changed={options.changed ?? []} actions={actions} />, {
    lang: options.lang,
  })
  return { ...view, actions }
}

describe("ScoreResults", () => {
  it("shows every part of the saved result, marked as AI output", () => {
    const { container } = renderScore(varied)
    const results = container.querySelector("[data-slot=ai-score-results]")!
    expect(results).toHaveAttribute("data-ai-generated", "true")
    expect(results).toHaveAttribute("data-score", String(varied.score.score))
    expect(screen.getByRole("heading", { level: 2, name: copy.results.title })).toBeInTheDocument()
    for (const slot of ["score-summary", "report-panel", "dimensions-panel", "judgements-panel", "checks-panel", "suggestions-panel", "how-we-score", "sources-panel"]) {
      expect(container.querySelector(`[data-slot=${slot}]`), slot).not.toBeNull()
    }
    expect(container.querySelector("[data-slot=outdated-banner]")).toBeNull()
    const shown = displayScore(varied.score.score, varied.score.sd)
    expect(container.querySelector("[data-slot=score-summary] [data-score]")).toHaveTextContent(String(shown.score))
  })

  it("says the score is outdated and lists the changed parts", () => {
    const edited = applyPatch(varied.project, { "businessPlan.opportunity.painPoint": "Boilers from 1994 in 5 of 8 buildings." }).project
    const { changed } = aiScoreStatus(edited)
    expect(changed).toEqual(["pain-point"])
    const { container } = renderScore(varied, { changed })
    const banner = screen.getByRole("complementary", { name: copy.results.outdated.title })
    expect(within(banner).getByText(copy.labels.judgements["pain-point"])).toBeInTheDocument()
    expect(container.querySelector('[data-part="pain-point"] [data-changed]')).not.toBeNull()
  })

  it("shows a capped score below Solid with the failed must-have check", () => {
    const { container } = renderScore(capped)
    expect(capped.score.capped).toBe(true)
    expect(container.querySelector("[data-slot=capped-note]")).not.toBeNull()
    expect(container.querySelector('[data-check="boundary"] [data-outcome=fail]')).not.toBeNull()
    expect(container.querySelector('[data-dimension="governance"] [data-cap]')).not.toBeNull()
  })

  it("offers to write a missing report and one in the other language", async () => {
    const { actions, unmount } = renderScore(varied)
    await userEvent.click(screen.getByRole("button", { name: copy.results.report.write }))
    expect(actions.rewriteReport).toHaveBeenCalledTimes(1)
    unmount()
    renderScore(varied, { score: withText(varied.score, { report: report("en") }), lang: "de" })
    const de = aiScoreCopy("de").results
    expect(screen.getByRole("button", { name: de.report.writeIn.replace("{language}", de.languages.de) })).toBeInTheDocument()
  })

  it("shows the saved suggestions and asks for more", async () => {
    const { actions } = renderScore(varied, { score: withText(varied.score, { report: report(), suggestions: suggestions() }) })
    expect(screen.getByRole("region", { name: copy.results.suggestions.parts })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: copy.results.suggestions.askAgain }))
    expect(actions.suggest).toHaveBeenCalledWith(undefined)
  })

  it("shows a failed request's error in the panel of that request", () => {
    const { rerender } = renderScore(varied, { actions: mockActions({ busy: "suggestions" }) })
    rerender(<ScoreResults project={varied.project} score={varied.score} changed={[]} actions={mockActions({ error: "network" })} />)
    const suggestionsPanel = document.querySelector<HTMLElement>("[data-slot=suggestions-panel]")!
    expect(within(suggestionsPanel).getByRole("alert")).toHaveTextContent(copy.results.errors.network)
    expect(within(document.querySelector<HTMLElement>("[data-slot=report-panel]")!).queryByRole("alert")).not.toBeInTheDocument()
  })

  it("shows a report error in the report panel by default", () => {
    const { container } = renderScore(varied, { actions: mockActions({ error: "key" }) })
    expect(within(container.querySelector<HTMLElement>("[data-slot=report-panel]")!).getByRole("alert")).toHaveTextContent(copy.results.errors.key)
  })

  it("deletes the score after confirming", async () => {
    const { actions } = renderScore(varied)
    await userEvent.click(screen.getByRole("button", { name: copy.results.remove.action }))
    await userEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: copy.results.remove.confirm }))
    expect(actions.remove).toHaveBeenCalledTimes(1)
  })

  it("waits with every AI action while a request runs", () => {
    renderScore(varied, { actions: mockActions({ busy: "report" }) })
    expect(screen.getByRole("button", { name: copy.results.report.writing })).toBeDisabled()
    expect(screen.getByRole("button", { name: copy.results.suggestions.ask })).toBeDisabled()
    expect(screen.getByRole("button", { name: copy.results.remove.action })).toBeDisabled()
  })
})

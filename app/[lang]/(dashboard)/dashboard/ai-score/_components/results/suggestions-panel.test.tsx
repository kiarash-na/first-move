import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it } from "vitest"
import { suggestionTargets } from "@/lib/ai/plan-score/suggest"
import { formatDateTime } from "@/lib/i18n/format"
import type { AiScore } from "@/lib/project"
import { SuggestionsPanel } from "./suggestions-panel"
import { scored, suggestions, withText, type Scored } from "./test-utils/fixtures"
import { aiScoreCopy, mockActions, renderResults } from "./test-utils/render"

let fixture: Scored
beforeAll(async () => {
  fixture = await scored()
})

const copy = aiScoreCopy("en")
const text = copy.results.suggestions

describe("SuggestionsPanel (D-77)", () => {
  it("asks for suggestions for every weak part on request", async () => {
    const actions = mockActions()
    renderResults(<SuggestionsPanel score={fixture.score} actions={actions} error={null} />)
    expect(screen.getByText(`${suggestionTargets(fixture.score).length} weak parts or checks`)).toBeInTheDocument()
    expect(screen.getByText(text.none)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: text.ask }))
    expect(actions.suggest).toHaveBeenCalledWith(undefined)
  })

  it("groups the saved suggestions by plan part and check, marked as AI output with model and date", () => {
    const saved = suggestions()
    const score = withText(fixture.score, { suggestions: saved })
    const { container } = renderResults(<SuggestionsPanel score={score} actions={mockActions()} error={null} />)
    const parts = screen.getByRole("region", { name: text.parts })
    expect(within(parts).getByRole("link", { name: copy.labels.judgements["pain-point"] })).toHaveAttribute("href", "#ai-score-part-pain-point")
    expect(within(parts).getByText(saved.items[0].texts[1])).toBeInTheDocument()
    const checks = screen.getByRole("region", { name: text.checks })
    expect(within(checks).getByRole("link", { name: copy.labels.gates.operator.name })).toHaveAttribute("href", "#ai-score-check-operator")
    expect(screen.getByText(`Suggested by provider/text-model on ${formatDateTime(saved.at, "en")}`)).toBeInTheDocument()
    expect(container.querySelector("[data-ai-generated]")).not.toBeNull()
    expect(screen.getByRole("button", { name: text.askAgain })).toBeInTheDocument()
  })

  it("says when the suggestions are in the other language", () => {
    const score = withText(fixture.score, { suggestions: suggestions("de") })
    renderResults(<SuggestionsPanel score={score} actions={mockActions()} error={null} />)
    expect(screen.getByText("These suggestions are in German. Ask again to get them in English.")).toBeInTheDocument()
  })

  it("has nothing to ask when no part is weak and no check failed", () => {
    const strong: AiScore = {
      ...fixture.score,
      judgements: fixture.score.judgements.map((entry) => ({ ...entry, source: "model" as const, level: 3, probabilities: [0, 0, 0, 1, 0] })),
      gates: fixture.score.gates.map((gate) => ({ ...gate, outcome: "pass" as const, probability: 0.9, cap: null })),
    }
    renderResults(<SuggestionsPanel score={strong} actions={mockActions()} error={null} />)
    expect(screen.getByText(text.nothing)).toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("shows busy and error states", () => {
    const { unmount } = renderResults(<SuggestionsPanel score={fixture.score} actions={mockActions({ busy: "suggestions" })} error={null} />)
    expect(screen.getByRole("button", { name: text.writing })).toBeDisabled()
    unmount()
    renderResults(<SuggestionsPanel score={fixture.score} actions={mockActions({ error: "rate" })} error="rate" />)
    expect(screen.getByRole("alert")).toHaveTextContent(copy.results.errors.rate)
  })
})

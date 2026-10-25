import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it } from "vitest"
import { WEAK_LEVEL } from "@/lib/ai/plan-score/report"
import type { AiJudgement } from "@/lib/project"
import { JudgementRow } from "./judgement-row"
import { scored, type Scored } from "./test-utils/fixtures"
import { aiScoreCopy, mockActions, renderResults } from "./test-utils/render"

let fixture: Scored
beforeAll(async () => {
  fixture = await scored()
})

const entry = (id: string): AiJudgement => fixture.score.judgements.find((judgement) => judgement.id === id)!
const copy = aiScoreCopy("en")

function renderRow(id: string, options: { changed?: boolean; suggestions?: string[]; actions?: ReturnType<typeof mockActions>; lang?: "en" | "de" } = {}) {
  const actions = options.actions ?? mockActions()
  const name = (copy.labels.judgements as Record<string, string>)[id]
  const view = renderResults(
    <ul>
      <JudgementRow entry={entry(id)} name={name} changed={options.changed ?? false} suggestions={options.suggestions ?? []} actions={actions} />
    </ul>,
    { lang: options.lang },
  )
  return { ...view, actions, name, row: view.container.querySelector<HTMLElement>(`[data-part="${id}"]`)! }
}

describe("JudgementRow", () => {
  it("names the nearest level and shows the expected level with one decimal", () => {
    const needs = entry("needs")
    // VARIED: needs = [0, 0.1, 0.2, 0.5, 0.2] → E = 2.8, nearest level 3 (Quantified).
    expect(needs.level).toBeCloseTo(2.8, 3)
    const { row } = renderRow("needs")
    expect(row.querySelector("[data-level-text]")).toHaveTextContent("Quantified · 2.8")
    expect(within(row).getByRole("img", { name: /Probability per level/ })).toBeInTheDocument()
    expect(row).toHaveTextContent(copy.labels.fieldSources.model)
    expect(row).toHaveAttribute("id", "ai-score-part-needs")
    expect(row).not.toHaveAttribute("data-weak")
  })

  it("links to the Business Plan step of its fields", () => {
    const { row } = renderRow("needs")
    expect(within(row).getByRole("link", { name: "Edit in Opportunity" })).toHaveAttribute("href", "/en/dashboard/business-plan/opportunity")
  })

  it("marks a changed part", () => {
    const { row } = renderRow("needs", { changed: true })
    expect(row.querySelector("[data-changed]")).toHaveTextContent(copy.results.parts.changed)
  })

  it("opens the five levels with their probabilities and the saved suggestions", async () => {
    const { row, name } = renderRow("needs", { suggestions: ["Quote the metered demand."] })
    await userEvent.click(within(row).getByRole("button", { name: `Details of ${name}` }))
    const levels = [...row.querySelectorAll<HTMLElement>("[data-level-row]")]
    expect(levels).toHaveLength(5)
    expect(levels.map((level) => level.lastElementChild?.textContent)).toEqual(["0%", "10%", "20%", "50%", "20%"])
    expect(levels[3]).toHaveAttribute("data-nearest", "true")
    expect(levels[3]).toHaveTextContent(copy.labels.levels.quantified.description)
    expect(within(row).getByText("Quote the metered demand.")).toBeInTheDocument()
    // Not weak: no suggest button.
    expect(within(row).queryByRole("button", { name: /Suggest improvements/ })).not.toBeInTheDocument()
  })

  it("offers suggestions for a weak part", async () => {
    // VARIED: pain-point = [0.3, 0.5, 0.2, 0, 0] → E = 0.9, below WEAK_LEVEL.
    expect(entry("pain-point").level!).toBeLessThan(WEAK_LEVEL)
    const { row, name, actions } = renderRow("pain-point")
    expect(row).toHaveAttribute("data-weak", "true")
    expect(row).toHaveTextContent(`Weak: below level ${WEAK_LEVEL}`)
    await userEvent.click(within(row).getByRole("button", { name: `Details of ${name}` }))
    await userEvent.click(within(row).getByRole("button", { name: `Suggest improvements for ${name}` }))
    expect(actions.suggest).toHaveBeenCalledWith(["pain-point"])
  })

  it("shows a refused part without a level", async () => {
    const { row, name } = renderRow("financing")
    expect(row.querySelector("[data-level-text]")).toHaveTextContent(copy.labels.fieldSources.refused)
    expect(within(row).queryByRole("img")).not.toBeInTheDocument()
    await userEvent.click(within(row).getByRole("button", { name: `Details of ${name}` }))
    expect(within(row).getByText(copy.results.parts.refused)).toBeInTheDocument()
  })

  it("uses German copy and number format", () => {
    const { row } = renderRow("needs", { lang: "de" })
    const de = aiScoreCopy("de")
    expect(row.querySelector("[data-level-text]")).toHaveTextContent(`${de.labels.levels.quantified.name} · 2,8`)
    expect(screen.getByRole("link")).toHaveAttribute("href", "/de/dashboard/business-plan/opportunity")
  })
})

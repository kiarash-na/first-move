import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it } from "vitest"
import { JUDGEMENTS, TURNS } from "@/lib/ai/plan-score/judgements"
import { JudgementsPanel } from "./judgements-panel"
import { scored, suggestions, withText, type Scored } from "./test-utils/fixtures"
import { aiScoreCopy, mockActions, renderResults } from "./test-utils/render"

let fixture: Scored
beforeAll(async () => {
  fixture = await scored()
})

describe("JudgementsPanel", () => {
  it("groups every plan part by its turn, in the order of the plan", () => {
    const copy = aiScoreCopy("en")
    const { container } = renderResults(<JudgementsPanel score={fixture.score} changed={[]} actions={mockActions()} />)
    for (const turn of TURNS) {
      const group = container.querySelector<HTMLElement>(`[data-turn="${turn}"]`)!
      expect(within(group).getByRole("heading", { level: 4 })).toHaveTextContent(`Turn ${turn} · ${copy.labels.turns[String(turn) as "1"]}`)
      const ids = [...group.querySelectorAll<HTMLElement>("[data-part]")].map((row) => row.dataset.part)
      expect(ids).toEqual(JUDGEMENTS.filter((judgement) => judgement.turn === turn).map((judgement) => judgement.id))
    }
    expect(container.querySelector("[data-slot=judgements-panel]")).toHaveAttribute("data-ai-generated", "true")
  })

  it("marks the changed parts and hands each its saved suggestions", async () => {
    const score = withText(fixture.score, { suggestions: suggestions() })
    const { container } = renderResults(<JudgementsPanel score={score} changed={["site"]} actions={mockActions()} />)
    expect(container.querySelector('[data-part="site"] [data-changed]')).not.toBeNull()
    expect(container.querySelector('[data-part="needs"] [data-changed]')).toBeNull()
    const row = container.querySelector<HTMLElement>('[data-part="pain-point"]')!
    await userEvent.click(within(row).getByRole("button", { name: /Details of/ }))
    expect(within(row).getByText(suggestions().items[0].texts[0])).toBeInTheDocument()
  })

  it("leaves out an id the labels do not know", () => {
    const score = { ...fixture.score, judgements: [...fixture.score.judgements, { ...fixture.score.judgements[0], id: "retired-part" }] }
    renderResults(<JudgementsPanel score={score} changed={[]} actions={mockActions()} />)
    expect(screen.queryByText("retired-part")).not.toBeInTheDocument()
  })
})

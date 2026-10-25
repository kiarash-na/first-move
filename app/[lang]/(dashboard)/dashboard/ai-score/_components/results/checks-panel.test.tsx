import { screen, within } from "@testing-library/react"
import { beforeAll, describe, expect, it } from "vitest"
import { ChecksPanel } from "./checks-panel"
import { scored, suggestions, withText, type Scored } from "./test-utils/fixtures"
import { aiScoreCopy, mockActions, renderResults } from "./test-utils/render"

let fixture: Scored
beforeAll(async () => {
  fixture = await scored()
})

describe("ChecksPanel", () => {
  it("lists every check in the order asked, then the three decisions", () => {
    const copy = aiScoreCopy("en").results.checks
    const { container } = renderResults(<ChecksPanel score={fixture.score} actions={mockActions()} />)
    const region = screen.getByRole("region", { name: copy.title })
    expect(region).toHaveAttribute("id", "ai-score-checks")
    const gates = within(screen.getByRole("region", { name: copy.gates }))
    expect(gates.getAllByRole("listitem").filter((item) => item.hasAttribute("data-check")).map((item) => item.dataset.check)).toEqual(
      fixture.score.gates.map((gate) => gate.id),
    )
    expect([...container.querySelectorAll<HTMLElement>("[data-branch]")].map((item) => item.dataset.branch)).toEqual(["anchor-type", "source-type", "ownership"])
  })

  it("hands each check its saved suggestions", () => {
    const score = withText(fixture.score, { suggestions: suggestions() })
    const { container } = renderResults(<ChecksPanel score={score} actions={mockActions()} />)
    expect(container.querySelector('[data-check="operator"]')).toHaveTextContent(suggestions().items[1].texts[0])
  })
})

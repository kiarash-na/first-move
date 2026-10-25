import { screen } from "@testing-library/react"
import { beforeAll, describe, expect, it } from "vitest"
import { displayScore } from "@/lib/business-plan"
import { ScoreSummary } from "./score-summary"
import { CAPPED, scored, type Scored } from "./test-utils/fixtures"
import { aiScoreCopy, renderResults } from "./test-utils/render"

let varied: Scored
let capped: Scored
beforeAll(async () => {
  ;[varied, capped] = await Promise.all([scored(), scored(CAPPED)])
})

describe("ScoreSummary", () => {
  it("shows the engine's score rounded to 5 with its band, the label and the AI marker", () => {
    const { container } = renderResults(<ScoreSummary score={varied.score} />)
    const copy = aiScoreCopy("en")
    const shown = displayScore(varied.score.score, varied.score.sd)
    expect(shown.score % 5).toBe(0)
    expect(container.querySelector("[data-score]")).toHaveTextContent(String(shown.score))
    expect(container.querySelector("[data-band]")).toHaveTextContent(`± ${shown.band}`)
    expect(screen.getByText(`AI Plan Score ${shown.score} of 100, plus or minus ${shown.band}`)).toBeInTheDocument()
    expect(screen.getByText(copy.labels.scoreLevels[varied.score.level].description)).toBeInTheDocument()
    expect(container.querySelector("[data-slot=score-summary]")).toHaveAttribute("data-ai-generated", "true")
    expect(screen.getByText(copy.results.aiGenerated)).toBeInTheDocument()
    expect(container).toHaveTextContent(`The label uses the unrounded score, ${varied.score.score}.`)
    expect(container).toHaveTextContent(`Band of one standard deviation: ${shown.score - shown.band} to ${shown.score + shown.band}`)
    expect(container.querySelector("[data-slot=capped-note]")).toBeNull()
  })

  it("puts the scale mark at the unrounded score", () => {
    const { container } = renderResults(<ScoreSummary score={varied.score} />)
    expect(container.querySelector<HTMLElement>("[data-marker]")!.style.left).toBe(`${varied.score.score}%`)
  })

  it("explains a failed must-have check and links to the checks", () => {
    renderResults(<ScoreSummary score={capped.score} />)
    const copy = aiScoreCopy("en")
    expect(capped.score.level).not.toBe("solid")
    expect(screen.getByText(copy.results.summary.seeChecks)).toHaveAttribute("href", "#ai-score-checks")
    expect(screen.getByText(/A must-have check failed/)).toHaveTextContent(copy.labels.scoreLevels.solid.name)
  })

  it("includes the Quick Check signal and the facts of the run", () => {
    renderResults(<ScoreSummary score={varied.score} />, { lang: "de" })
    const copy = aiScoreCopy("de")
    expect(screen.getByText(copy.results.signal.title)).toBeInTheDocument()
    expect(screen.getByRole("list", { name: copy.results.meta.label })).toBeInTheDocument()
  })
})

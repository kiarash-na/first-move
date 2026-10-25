import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AI_GATE_OUTCOMES } from "@/lib/project"
import { OutcomeTag } from "./outcome-tag"
import { aiScoreCopy, renderResults } from "./test-utils/render"

describe("OutcomeTag", () => {
  it.each(AI_GATE_OUTCOMES)("names the outcome %s in words and with an icon", (outcome) => {
    renderResults(<OutcomeTag outcome={outcome} />)
    const tag = screen.getByText(aiScoreCopy("en").labels.outcomes[outcome])
    expect(tag).toHaveAttribute("data-outcome", outcome)
    expect(tag.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })

  it("takes another word where the outcome alone would mislead", () => {
    renderResults(<OutcomeTag outcome="skipped" label="No answer" />)
    expect(screen.getByText("No answer")).toHaveAttribute("data-outcome", "skipped")
    expect(screen.queryByText(aiScoreCopy("en").labels.outcomes.skipped)).not.toBeInTheDocument()
  })

  it("uses orange for a failed check and cyan for a passed one", () => {
    renderResults(
      <>
        <OutcomeTag outcome="fail" />
        <OutcomeTag outcome="pass" />
      </>,
      { lang: "de" },
    )
    const copy = aiScoreCopy("de").labels.outcomes
    expect(screen.getByText(copy.fail)).toHaveClass("text-hot")
    expect(screen.getByText(copy.pass)).toHaveClass("text-primary")
  })
})

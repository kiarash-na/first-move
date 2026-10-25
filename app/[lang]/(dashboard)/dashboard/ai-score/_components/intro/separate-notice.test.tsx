import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { aiScoreCopy, aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { SeparateNotice } from "./separate-notice"

describe("SeparateNotice (D-71, D-74)", () => {
  it("says the score is a separate AI opinion, not the calculation or a verdict, and links the docs", () => {
    const copy = aiScoreCopy().intro
    renderAiScore(<SeparateNotice />, { store: aiScoreStore(example()).store })
    const notice = screen.getByRole("complementary", { name: copy.title })
    expect(notice).toHaveTextContent(copy.points.calculation)
    expect(notice).toHaveTextContent(copy.points.verdict)
    expect(notice).toHaveTextContent(copy.points.models)
    expect(screen.getByRole("link", { name: copy.docs })).toHaveAttribute("href", "/en/docs/ai-plan-score")
  })

  it("speaks German", () => {
    const copy = aiScoreCopy("de").intro
    renderAiScore(<SeparateNotice />, { store: aiScoreStore(example()).store, lang: "de" })
    expect(screen.getByRole("complementary", { name: copy.title })).toHaveTextContent("Pitch-Vollständigkeit")
    expect(screen.getByRole("link", { name: copy.docs })).toHaveAttribute("href", "/de/docs/ai-plan-score")
  })
})

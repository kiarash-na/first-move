import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import aiScoreDe from "@/dictionaries/de/ai-score.json"
import aiScoreEn from "@/dictionaries/en/ai-score.json"
import de from "@/dictionaries/de/presentation.json"
import en from "@/dictionaries/en/presentation.json"
import { blindSummary } from "@/lib/presentation/blind-test/summary"
import { KNOWN_OUTCOME } from "@/lib/presentation/blind-test/geblergasse-2017"
import { AiEngineSlide, blindView } from "./ai-engine-slide"

describe("blindView", () => {
  it("formats the recorded run in German and names everything with the app's own labels", () => {
    const view = blindView("de", blindSummary("de"), de.slides.aiEngine, aiScoreDe.labels)
    expect(view.input).toContain("30. Oktober 2017")
    expect(view.decided).toMatch(/^Entschieden in \d+,\d\s?s$/)
    expect(view.levelName).toBe(aiScoreDe.labels.scoreLevels.promising.name)
    expect(view.seats).toHaveLength(7)
    expect(view.seats.map((seat) => seat.name)).not.toContain("value")
    expect(view.mustHave.length).toBeGreaterThan(0)
    expect(view.tryHref).toBe("/de/dashboard/ai-score")
  })

  it("links every outcome to its own source", () => {
    const view = blindView("en", blindSummary("en"), en.slides.aiEngine, aiScoreEn.labels)
    expect(view.outcome.map((item) => item.url)).toEqual([KNOWN_OUTCOME.sources.built, KNOWN_OUTCOME.sources.running, KNOWN_OUTCOME.sources.award])
  })
})

describe("AiEngineSlide", () => {
  it("shows the engine's counts and links the sources page", () => {
    render(<AiEngineSlide number={5} lang="en" copy={en.slides.aiEngine} labels={aiScoreEn.labels} summary={blindSummary("en")} />)
    expect(screen.getByText(en.slides.aiEngine.facts.judgements).nextElementSibling).toHaveTextContent("27")
    expect(screen.getByRole("link", { name: en.slides.aiEngine.sources })).toHaveAttribute("href", "/en/docs/ai-plan-score")
    expect(screen.getByRole("button", { name: en.slides.aiEngine.run })).toBeInTheDocument()
  })
})

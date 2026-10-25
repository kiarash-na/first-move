import { screen } from "@testing-library/react"
import { beforeAll, describe, expect, it } from "vitest"
import { formatDateTime } from "@/lib/i18n/format"
import { METHOD_VERSION } from "@/lib/ai/plan-score/run"
import { ScoreMeta } from "./score-meta"
import { report, scored, withText, type Scored } from "./test-utils/fixtures"
import { aiScoreCopy, renderResults } from "./test-utils/render"

let fixture: Scored
beforeAll(async () => {
  fixture = await scored()
})

describe("ScoreMeta", () => {
  it("lists date, method, models and tokens", () => {
    const score = withText(fixture.score, { report: report(), textTokens: 1200 })
    renderResults(<ScoreMeta score={score} />)
    const list = screen.getByRole("list", { name: aiScoreCopy("en").results.meta.label })
    expect(list).toHaveTextContent(`Scored on ${formatDateTime(score.at, "en")}`)
    expect(list).toHaveTextContent(`Method ${METHOD_VERSION}`)
    expect(list).toHaveTextContent("Decisions by jev-test")
    expect(list).toHaveTextContent("Report by provider/text-model")
    // Four Jev turns at 1,200 input tokens each (VARIED), plus the text tokens.
    expect(score.usage.decisionTokens).toBe(4800)
    expect(list).toHaveTextContent("6,000 tokens (4,800 for decisions, 1,200 for text)")
  })

  it("says when no report was written yet", () => {
    renderResults(<ScoreMeta score={fixture.score} />, { lang: "de" })
    expect(screen.getByText(aiScoreCopy("de").results.meta.noReport)).toBeInTheDocument()
  })
})

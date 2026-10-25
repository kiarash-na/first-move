import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { QuickCheckSignal } from "./quick-check-signal"
import { aiScoreCopy, renderResults, resultDictionaries } from "./test-utils/render"

describe("QuickCheckSignal", () => {
  it("shows the verdict and the figures as a fixed signal", () => {
    const copy = aiScoreCopy("en").results.signal
    renderResults(<QuickCheckSignal signal={{ level: "further_analysis", heatDensityMwhPerM: 1.234, economicRatio: 0.857 }} />)
    expect(screen.getByText(resultDictionaries("en")["quick-check"].results.levels.further_analysis.label)).toBeInTheDocument()
    expect(screen.getByText("1.23 MWh/m")).toBeInTheDocument()
    expect(screen.getByText("E = 0.86")).toBeInTheDocument()
    expect(screen.getByText(copy.note)).toBeInTheDocument()
  })

  it("formats the figures in German and leaves out a missing ratio", () => {
    renderResults(<QuickCheckSignal signal={{ level: "promising", heatDensityMwhPerM: 0.5, economicRatio: null }} />, { lang: "de" })
    expect(screen.getByText("0,5 MWh/m")).toBeInTheDocument()
    expect(screen.queryByText(aiScoreCopy("de").results.signal.economicRatio)).not.toBeInTheDocument()
  })

  it("says when the run had no Quick Check", () => {
    renderResults(<QuickCheckSignal signal={null} />)
    expect(screen.getByText(aiScoreCopy("en").results.signal.none)).toBeInTheDocument()
  })
})

import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DimensionLegend } from "./dimension-legend"
import { aiScoreCopy, renderResults } from "./test-utils/render"

describe("DimensionLegend", () => {
  it.each(["en", "de"] as const)("names every mark of the dimension bars (%s)", (lang) => {
    const copy = aiScoreCopy(lang).results.dimensions.legend
    renderResults(<DimensionLegend />, { lang })
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([copy.score, copy.raw, copy.cap, copy.band])
  })
})

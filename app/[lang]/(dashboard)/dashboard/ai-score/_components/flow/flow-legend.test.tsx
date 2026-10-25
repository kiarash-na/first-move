import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { aiScoreCopy, aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { FlowLegend } from "./flow-legend"

describe("FlowLegend", () => {
  it("names every level step, the empty and unanswered marks, every outcome and the edge", () => {
    const copy = aiScoreCopy()
    renderAiScore(<FlowLegend />, { store: aiScoreStore(example()).store })
    const legend = screen.getByRole("group", { name: copy.flow.legend.label })
    for (const level of Object.values(copy.labels.levels)) expect(legend).toHaveTextContent(level.name)
    for (const outcome of Object.values(copy.labels.outcomes)) expect(legend).toHaveTextContent(outcome)
    expect(legend).toHaveTextContent(copy.flow.legend.empty)
    expect(legend).toHaveTextContent(copy.flow.legend.refused)
    expect(legend).toHaveTextContent(copy.flow.legend.edge)
    expect(legend.querySelectorAll("[data-slot='gate-glyph']")).toHaveLength(4)
  })
})

import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { DECISION_MODEL_ID } from "@/lib/ai/plan-score/run"
import { aiScoreCopy, aiScoreStore, renderAiScore } from "../test-utils/render"
import { example } from "../test-utils/scored"
import { DECISION_MODEL_VERSION, DecisionModel } from "./decision-model"

describe("DecisionModel", () => {
  it("shows Jev with the pinned version and zero data retention", () => {
    const copy = aiScoreCopy().setup.decision
    renderAiScore(<DecisionModel />, { store: aiScoreStore(example()).store })
    expect(DECISION_MODEL_ID.endsWith(DECISION_MODEL_VERSION)).toBe(true)
    expect(screen.getByText(copy.name)).toBeInTheDocument()
    expect(screen.getByText(`Version ${DECISION_MODEL_VERSION}, fixed`)).toBeInTheDocument()
    expect(screen.getByText(copy.zdr)).toBeInTheDocument()
  })
})

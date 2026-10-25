import { describe, expect, it } from "vitest"

import { aiScoreCopy } from "../test-utils/render"
import type { BranchView, GateView, JudgementView } from "./flow-model"
import { branchText, countedLevel, gateText, judgementText } from "./node-text"

const en = aiScoreCopy()
const de = aiScoreCopy("de")
const judgement: JudgementView = { kind: "judgement", id: "site", turn: 1, dimension: "technology", source: "model", level: 3.04, probabilities: [0, 0, 0.1, 0.76, 0.14], changed: false }
const gate: GateView = { kind: "gate", id: "boundary", turn: 2, dimension: "governance", branch: null, source: "model", probability: 0.25, outcome: "unclear", cap: null, effect: { kind: "cap", level: 2, conditional: false } }
const branch: BranchView = { kind: "branch", id: "ownership", turn: 2, choice: "community", probabilities: { community: 0.8 }, followUp: "owner-community" }

describe("node text", () => {
  it("describes a judgement by its level and Jev's confidence", () => {
    expect(judgementText(judgement, en, "en")).toEqual({ result: "3.0 · Quantified", certainty: expect.stringMatching(/^\d{1,3}%$/) })
    expect(judgementText({ ...judgement, probabilities: [0, 0, 0, 1, 0] }, en, "en").certainty).toBe("100%")
    expect(judgementText(judgement, de, "de").result).toBe("3,0 · Beziffert")
    expect(judgementText({ ...judgement, source: "empty", level: 0, probabilities: null }, en, "en")).toEqual({ result: "Empty · 0", certainty: null })
    expect(judgementText({ ...judgement, source: "refused", level: null, probabilities: null }, en, "en").result).toBe("No answer")
    expect(countedLevel({ ...judgement, source: "empty", level: 0 })).toBe(0)
    expect(countedLevel({ ...judgement, source: "refused", level: null })).toBeNull()
  })

  it("describes a check by outcome, probability and applied cap", () => {
    expect(gateText(gate, en, "en")).toEqual({ result: "Unclear · 25%", certainty: "25%" })
    expect(gateText({ ...gate, outcome: "fail", probability: 0.1, cap: 2 }, en, "en").result).toBe("Fail · caps at 2")
    expect(gateText({ ...gate, source: "rule", outcome: "fail", probability: null, cap: 2 }, de, "de")).toEqual({ result: "Nicht erfüllt · begrenzt auf 2", certainty: null })
    expect(gateText({ ...gate, source: "refused", outcome: "skipped", probability: null }, en, "en").result).toBe("No answer")
  })

  it("describes a branch by the chosen option", () => {
    expect(branchText(branch, en, "en")).toEqual({ result: "Users together", certainty: "80%" })
    expect(branchText({ ...branch, choice: "refused", probabilities: {} }, en, "en")).toEqual({ result: "No answer", certainty: null })
  })
})

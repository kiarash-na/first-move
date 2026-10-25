import { describe, expect, it } from "vitest"

import { aiScoreCopy } from "../test-utils/render"
import {
  branchName,
  branchQuestion,
  dimensionName,
  gateName,
  gateQuestion,
  judgementName,
  levelName,
  nodeName,
  optionName,
  outcomeName,
  turnName,
} from "./flow-labels"

const labels = aiScoreCopy().labels
const de = aiScoreCopy("de").labels

describe("flow labels", () => {
  it("names every kind of id from the shared labels", () => {
    expect(judgementName(labels, "cost-basis")).toBe("Costs and capital expenditure")
    expect(gateName(labels, "water-permit")).toBe("Permit route for water or ground")
    expect(branchName(labels, "source-type")).toBe("Main heat source")
    expect(optionName(labels, "source-type", "groundwater")).toBe("Groundwater")
    expect(dimensionName(labels, "economics")).toBe("Costs, revenues and financing")
    expect(turnName(labels, 0)).toBe("Read the plan")
    expect(outcomeName(labels, "skipped")).toBe("Not asked")
    expect(levelName(labels, 2.4)).toBe("Specific")
    expect(gateQuestion(labels, "anchor")).toMatch(/anchor customer/)
    expect(branchQuestion(labels, "ownership")).toMatch(/ownership and operating model/)
    expect(levelName(de, 3.6)).toBe("Belegt")
  })

  it("falls back to the id for an unknown one", () => {
    expect(judgementName(labels, "nope")).toBe("nope")
    expect(optionName(labels, "source-type", "nope")).toBe("nope")
    expect(gateQuestion(labels, "nope")).toBeNull()
    expect(nodeName(labels, { kind: "branch", id: "anchor-type", turn: 1, choice: "none", probabilities: {}, followUp: null })).toBe("Anchor type")
  })
})

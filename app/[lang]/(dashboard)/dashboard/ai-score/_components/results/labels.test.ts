import { describe, expect, it } from "vitest"
import en from "@/dictionaries/en/ai-score.json"
import { branchCopy, gateCopy, judgementName, keyName, optionName } from "./labels"

const labels = en.labels

describe("result labels", () => {
  it("names judgements, checks, branches and options", () => {
    expect(judgementName(labels, "pain-point")).toBe(labels.judgements["pain-point"])
    expect(gateCopy(labels, "boundary")).toEqual(labels.gates.boundary)
    expect(branchCopy(labels, "ownership")?.name).toBe(labels.branches.ownership.name)
    expect(optionName(labels, "source-type", "groundwater")).toBe(labels.branches["source-type"].options.groundwater)
  })

  it("names a key as a plan part first, then as a check", () => {
    expect(keyName(labels, "ownership")).toBe(labels.judgements.ownership)
    expect(keyName(labels, "water-permit")).toBe(labels.gates["water-permit"].name)
  })

  it("returns null for unknown ids, also for inherited keys", () => {
    expect(judgementName(labels, "nope")).toBeNull()
    expect(gateCopy(labels, "toString")).toBeNull()
    expect(optionName(labels, "nope", "x")).toBeNull()
    expect(optionName(labels, "ownership", "nope")).toBeNull()
    expect(keyName(labels, "nope")).toBeNull()
  })
})

import { describe, expect, it } from "vitest"
import { JUDGEMENTS } from "@/lib/ai/plan-score/judgements"
import { referenceOf } from "@/lib/docs/references"
import { citedDimensions, METHOD_ROLES, PROVIDER_IDS } from "./citations"

describe("citations", () => {
  it("finds the dimensions that cite a source", () => {
    // `anchor` (participation) and `extra-value`/`advantage` (value) cite ALG-10, among others.
    expect(citedDimensions("ALG-10")).toEqual(expect.arrayContaining(["value", "participation", "governance"]))
    expect(citedDimensions("SRC-WRG-1959")).toEqual(["technology"])
    expect(citedDimensions("SRC-NOT-CITED")).toEqual([])
  })

  it("covers the sources of every judgement", () => {
    for (const judgement of JUDGEMENTS) for (const source of judgement.sources) expect(citedDimensions(source), source).toContain(judgement.dimension)
  })

  it("lists only provider ids, sorted and once", () => {
    expect(PROVIDER_IDS.length).toBeGreaterThan(0)
    expect(PROVIDER_IDS.every((id) => /^(BM|ALG)-/.test(id))).toBe(true)
    expect(new Set(PROVIDER_IDS).size).toBe(PROVIDER_IDS.length)
    expect(PROVIDER_IDS.indexOf("ALG-9")).toBe(-1)
    expect(PROVIDER_IDS.indexOf("ALG-09")).toBeLessThan(PROVIDER_IDS.indexOf("ALG-10"))
  })

  it("names method roles only for verified references", () => {
    for (const id of Object.keys(METHOD_ROLES)) expect(referenceOf(id), id).toBeDefined()
  })
})

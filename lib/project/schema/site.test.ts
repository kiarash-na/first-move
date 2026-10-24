// @vitest-environment node
import { describe, expect, it } from "vitest"
import { TEXT_LIMITS } from "@/lib/project/fields/limits"
import { siteSchema } from "./site"

const site = {
  name: "Alpine village",
  location: "Tyrol",
  siteType: "Rural village",
  ownership: "Private ownership, tourist accommodation, commercial",
  units: "20-70 units (phased development)",
  currentSupply: [],
  stakeholders: ["Private households", "Hotel"],
  partners: ["Municipality", "Ski resort"],
}

describe("siteSchema", () => {
  it("has a home for every fact a BM-SCN scenario states (OQ-25)", () => {
    expect(siteSchema.safeParse(site).success).toBe(true)
  })

  it("stores text as typed, without trimming", () => {
    const result = siteSchema.safeParse({ ...site, name: "  Spaced  <b>name</b> " })
    expect(result.data?.name).toBe("  Spaced  <b>name</b> ")
  })

  it("limits text length and list size", () => {
    expect(siteSchema.safeParse({ ...site, name: "x".repeat(TEXT_LIMITS.short + 1) }).success).toBe(false)
    const tooMany = Array(TEXT_LIMITS.listEntries + 1).fill("Partner")
    expect(siteSchema.safeParse({ ...site, partners: tooMany }).success).toBe(false)
  })
})

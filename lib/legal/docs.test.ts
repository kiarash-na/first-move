import { describe, expect, it } from "vitest"
import { AREAS } from "@/lib/i18n/dictionaries"
import { LEGAL_DOCS, isLegalSlug } from "./docs"

describe("legal documents", () => {
  it("lists the six documents in footer order", () => {
    expect([...LEGAL_DOCS]).toEqual(["terms", "privacy", "cookies", "imprint", "ai", "license"])
  })

  it("has a dictionary area for every document", () => {
    for (const slug of LEGAL_DOCS) expect(AREAS as readonly string[]).toContain(slug)
  })

  it("recognises only listed slugs", () => {
    expect(isLegalSlug("terms")).toBe(true)
    expect(isLegalSlug("legal")).toBe(false)
    expect(isLegalSlug(undefined)).toBe(false)
  })
})

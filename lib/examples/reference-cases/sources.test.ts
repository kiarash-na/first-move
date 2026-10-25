// @vitest-environment node
import { describe, expect, it } from "vitest"
import { REFERENCE_KINDS, REFERENCES } from "@/lib/docs/references"
import { REFERENCE_CASE_SOURCES, referenceCaseSourceOf } from "./sources"

/** News sites and blogs are not sources for the reference cases (owner, 2026-10-25). */
const NEWS = /\b(?:orf\.at|derstandard|diepresse|kurier\.at|krone\.at|heute\.at|vienna\.at|meinbezirk|falter\.at|profil\.at|medium\.com|blogspot|wordpress\.com)\b/

describe("REFERENCE_CASE_SOURCES (D-76)", () => {
  it("has unique RC- ids that do not clash with the method references", () => {
    const ids = REFERENCE_CASE_SOURCES.map((source) => source.id)
    for (const id of ids) expect(id).toMatch(/^RC-[A-Z0-9-]+$/)
    expect(new Set(ids).size).toBe(ids.length)
    for (const reference of REFERENCES) expect(ids).not.toContain(reference.id)
  })

  it("links only over https, each URL once, and none twice across both lists", () => {
    const urls = REFERENCE_CASE_SOURCES.map((source) => source.url)
    for (const url of urls) expect(url).toMatch(/^https:\/\/[^\s]+$/)
    expect(new Set(urls).size).toBe(urls.length)
    const methodUrls = new Set(REFERENCES.map((reference) => reference.url))
    for (const url of urls) expect(methodUrls.has(url), url).toBe(false)
  })

  it("cites papers through doi.org and uses no news sites or blogs", () => {
    for (const source of REFERENCE_CASE_SOURCES) {
      expect(REFERENCE_KINDS).toContain(source.kind)
      if (source.kind === "peer-reviewed") expect(source.url, source.id).toMatch(/^https:\/\/doi\.org\/10\.\d{4,}\//)
      expect(source.url, source.id).not.toMatch(NEWS)
    }
  })

  it("records who wrote each source, when, and the day its link was checked", () => {
    for (const source of REFERENCE_CASE_SOURCES) {
      expect(source.authors.trim(), source.id).not.toBe("")
      expect(source.title.trim(), source.id).not.toBe("")
      expect(source.source.trim(), source.id).not.toBe("")
      expect(source.year, source.id).toBeGreaterThanOrEqual(2000)
      expect(source.year, source.id).toBeLessThanOrEqual(2026)
      expect(source.checked, source.id).toBe("2026-10-25")
    }
  })

  it("finds a source by id", () => {
    expect(referenceCaseSourceOf("RC-WIEN-SEEBOGEN")?.url).toBe("https://www.wien.gv.at/umwelt/energie-projekt-kraftwerk-seebogen")
    expect(referenceCaseSourceOf("SRC-BUFFA-2019")).toBeUndefined()
  })
})

// @vitest-environment node
import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { headingId } from "@/lib/docs/heading-id"
import { referenceOf } from "@/lib/docs/references"
import { LOCALES } from "@/lib/i18n/locales"
import { FICTIONAL_DISCLAIMER, REFERENCE_CASES, referenceCaseSourceOf } from "./index"

/**
 * The public page of the reference cases (D-76) must hold a section per case whose heading is the
 * case name, so the start-screen card can link to `#headingId(name)`, and each section must list
 * the case's sources. The general docs rules live in `content/docs/content.test.ts`.
 */
const page = (lang: string) => readFileSync(path.resolve(__dirname, "../../../content/docs", lang, "reference-cases.mdx"), "utf8")

/** The text of each `## …` section, by heading. */
function sections(text: string): Map<string, string> {
  const parts = text.split(/^## /m).slice(1)
  return new Map(parts.map((part) => [part.slice(0, part.indexOf("\n")).trim(), part]))
}

describe.each(LOCALES)("the reference cases docs page (%s)", (lang) => {
  const byHeading = sections(page(lang))

  it("has one section per case, headed by the case name, in catalog order", () => {
    const names = REFERENCE_CASES.map((entry) => entry.name[lang] ?? entry.name.en)
    for (const name of names) expect(byHeading.has(name), name).toBe(true)
    const headings = [...byHeading.keys()]
    expect(headings.filter((heading) => names.includes(heading))).toEqual(names)
    expect(new Set(names.map(headingId)).size).toBe(names.length)
  })

  it("links every source a case cites, in its own section", () => {
    for (const entry of REFERENCE_CASES) {
      const section = byHeading.get(entry.name[lang] ?? entry.name.en)!
      for (const id of entry.references) {
        const url = (referenceCaseSourceOf(id) ?? referenceOf(id))!.url
        expect(section, `${entry.id}: ${id}`).toContain(`](${url})`)
      }
    }
  })

  it("carries the disclaimer in each fictional section and in no real one", () => {
    for (const entry of REFERENCE_CASES) {
      const section = byHeading.get(entry.name[lang] ?? entry.name.en)!
      expect(section.includes(FICTIONAL_DISCLAIMER[lang]!), entry.id).toBe(entry.kind === "fictional")
    }
  })
})

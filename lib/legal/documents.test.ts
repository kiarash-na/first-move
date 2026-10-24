// @vitest-environment node
import { describe, expect, it } from "vitest"
import { dictionaryLoaders } from "@/lib/i18n/dictionaries"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { LOCALES, type Locale } from "@/lib/i18n/locales"
import { LEGAL_DOCS, type LegalSlug } from "./docs"
import { interpolate, tokensIn, LEGAL_TOKENS } from "./interpolate"
import { tokenizeInline } from "./inline"
import { blockShape, parseBlocks } from "./parse-blocks"
import type { LegalDocCopy } from "./types"

/** Routes a legal text may link to (the six documents plus the public app and docs). */
const ROUTES = new Set<string>(["/", "/dashboard", "/docs", ...LEGAL_DOCS.map((slug) => `/${slug}`)])

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value]
  if (Array.isArray(value)) return value.flatMap(strings)
  if (value && typeof value === "object") return Object.values(value).flatMap(strings)
  return []
}

async function merged(lang: Locale, slug: LegalSlug) {
  return (await getDictionary(lang, slug)) as unknown as LegalDocCopy
}

async function raw(lang: Locale, slug: LegalSlug) {
  return (await dictionaryLoaders[lang][slug]()) as Partial<LegalDocCopy>
}

describe.each(LEGAL_DOCS)("legal document %s", (slug) => {
  describe.each(LOCALES)("in %s", (lang) => {
    it("has a title, an intro, a valid date and version, and at least one section", async () => {
      const doc = await merged(lang, slug)
      expect(doc.meta.title.trim()).not.toBe("")
      expect(doc.meta.description.trim()).not.toBe("")
      expect(doc.title.trim()).not.toBe("")
      expect(doc.intro.trim()).not.toBe("")
      expect(doc.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(new Date(doc.updated).getTime())).toBe(false)
      expect(doc.version).toMatch(/^\d+\.\d+$/)
      expect(doc.sections.length).toBeGreaterThanOrEqual(3)
    })

    it("has unique kebab-case section ids and a heading and body for each", async () => {
      const { sections } = await merged(lang, slug)
      const ids = sections.map((section) => section.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const section of sections) {
        expect(section.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
        expect(section.heading.trim(), section.id).not.toBe("")
        expect(section.body.length, section.id).toBeGreaterThan(0)
        for (const line of section.body) expect(line.trim(), section.id).not.toBe("")
      }
    })

    it("resolves every {{token}} and leaves no placeholder text", async () => {
      const doc = await merged(lang, slug)
      for (const text of strings(doc)) {
        for (const token of tokensIn(text)) expect(LEGAL_TOKENS[token], `{{${token}}}`).toBeDefined()
        const out = interpolate(text, lang)
        expect(out).not.toMatch(/\{\{|\}\}/)
        expect(out).not.toMatch(/\b(TODO|TBD|FIXME|XXX|lorem ipsum|placeholder)\b/i)
      }
    })

    it("links only to routes and anchors that exist", async () => {
      const doc = await merged(lang, slug)
      const own = new Set(doc.sections.map((section) => section.id))
      const anchorsByRoute = new Map<string, Set<string>>()
      for (const other of LEGAL_DOCS) {
        anchorsByRoute.set(`/${other}`, new Set((await merged(lang, other)).sections.map((section) => section.id)))
      }
      const lines = [doc.intro, ...doc.sections.flatMap((section) => section.body)]
      for (const token of lines.flatMap((line) => tokenizeInline(interpolate(line, lang)))) {
        if (token.type !== "link") continue
        if (token.kind === "anchor") expect(own.has(token.href.slice(1)), token.href).toBe(true)
        if (token.kind === "internal") {
          const [route, hash] = token.href.split("#")
          expect(ROUTES.has(route), token.href).toBe(true)
          if (hash) expect(anchorsByRoute.get(route)?.has(hash), token.href).toBe(true)
        }
      }
    })
  })

  it("has a complete German text with the same structure as the English one (D-44)", async () => {
    const en = await raw("en", slug)
    const de = await raw("de", slug)
    expect(de.title, "German title").toBeTruthy()
    expect(de.intro, "German intro").toBeTruthy()
    expect(de.meta?.title, "German meta title").toBeTruthy()
    expect(de.meta?.description, "German meta description").toBeTruthy()
    expect(de.updated, "German date").toBe(en.updated)
    expect(de.version, "German version").toBe(en.version)
    expect(de.sections?.map((section) => section.id)).toEqual(en.sections?.map((section) => section.id))
    en.sections?.forEach((section, index) => {
      expect(blockShape(de.sections?.[index]?.body ?? []), section.id).toEqual(blockShape(section.body))
      expect(de.sections?.[index]?.heading?.trim(), `German heading ${section.id}`).toBeTruthy()
    })
  })

  it("keeps the formatting grammar valid in every body line", async () => {
    const { sections } = await merged("en", slug)
    for (const section of sections) {
      const blocks = parseBlocks(section.body)
      for (const block of blocks) {
        if (block.type === "table") {
          expect(block.head.length, section.id).toBeGreaterThan(1)
          for (const row of block.rows) expect(row.length, section.id).toBe(block.head.length)
        }
      }
    }
  })
})

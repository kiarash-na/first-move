// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { headingId } from "@/lib/docs/heading-id"
import english from "@/lib/ai/knowledge/generated/en.json"
import { DOCS_DIR, slugify } from "./gen-knowledge.mjs"

const root = path.resolve(__dirname, "..")
const pagesDir = path.join(root, DOCS_DIR, "en")
const pages = readdirSync(pagesDir).filter((file) => file.endsWith(".mdx"))
const headings = (file: string) =>
  readFileSync(path.join(pagesDir, file), "utf8")
    .split("\n")
    .filter((line) => /^##\s/.test(line))
    .map((line) => line.replace(/^##\s+/, "").trim())

/**
 * The knowledge index links to `/{lang}/docs/{slug}#{anchor}` with `slugify()` of the script; the
 * docs route renders h2 ids with `headingId()` of the core. Both must give the same id (A04).
 */
describe("heading anchors: generator and docs route agree", () => {
  it.each([
    "Quick Check",
    "Step 1: Opportunity",
    "Step 4: Implementation",
    "What is 5GDHC?",
    "Pitch readiness (unofficial)",
    "Inputs & results",
    "Wärme und Kälte",
    "Größe der Fläche, Übersicht",
    "Économie : déjà vu",
    "Heizwärme 2011–heute",
    "Up to 20 versions, 5 files (10 MB)",
    "EQ-3.4a, TBL-6 and OQ-20",
    "The first email: confirm once",
    "  Spaces   around  ",
    "Who's who? A/B/C",
  ])("%s", (heading) => {
    expect(headingId(heading)).toBe(slugify(heading))
  })

  it("gives every heading of the public pages the same id in both", () => {
    expect(pages.length).toBeGreaterThan(0)
    for (const file of pages) {
      for (const heading of headings(file)) expect(headingId(heading), `${file}: ${heading}`).toBe(slugify(heading))
    }
  })

  it("links every docs chunk of the index to a heading that exists on its page", () => {
    const docs = (english as { id: string; url: string }[]).filter((chunk) => chunk.id.startsWith("docs:"))
    expect(docs.length).toBeGreaterThan(0)
    for (const chunk of docs) {
      const [pathname, anchor] = chunk.url.split("#")
      const slug = pathname === "/en/docs" ? "index" : pathname.replace("/en/docs/", "")
      expect(pages, chunk.url).toContain(`${slug}.mdx`)
      if (anchor) expect(headings(`${slug}.mdx`).map(headingId), chunk.url).toContain(anchor)
    }
  })
})

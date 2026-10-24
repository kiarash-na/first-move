// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { afterAll, describe, expect, it } from "vitest"
import { fieldsOf, groupsOf } from "@/lib/project/fields/registry"
import en from "@/dictionaries/en/quick-check.json"
import bp from "@/dictionaries/en/business-plan.json"
import {
  ALLOWED_SOURCES,
  docsChunks,
  generateKnowledge,
  MAX_CHUNK,
  mdxSections,
  outdatedFiles,
  packLines,
  slugify,
  stepOf,
} from "./gen-knowledge.mjs"

const root = path.resolve(__dirname, "..")
const files = generateKnowledge(root)
const chunks = files.flatMap((file: { content: string }) => JSON.parse(file.content)) as {
  id: string
  lang: string
  title: string
  url: string
  text: string
  source: string
}[]

const temp = mkdtempSync(path.join(tmpdir(), "knowledge-"))
afterAll(() => rmSync(temp, { recursive: true, force: true }))

const lookup = (node: unknown, key: string) =>
  key.split(".").reduce<unknown>((value, segment) => (value && typeof value === "object" ? (value as Record<string, unknown>)[segment] : undefined), node)

describe("gen:knowledge", () => {
  it("has written every generated file as the generator produces it (run `pnpm gen:knowledge`)", () => {
    expect(outdatedFiles(root, files)).toEqual([])
  })

  it("takes text only from public docs and allow-listed dictionary nodes, never from internal docs", () => {
    expect(chunks.length).toBeGreaterThan(20)
    for (const chunk of chunks) {
      expect(ALLOWED_SOURCES.some((prefix: string) => chunk.source.startsWith(prefix)), chunk.source).toBe(true)
      expect(chunk.source.startsWith("docs/"), chunk.source).toBe(false)
    }
  })

  it("keeps chunks small, ids unique, links on the site in the chunk's language", () => {
    for (const chunk of chunks) {
      expect(chunk.text.length).toBeLessThanOrEqual(MAX_CHUNK)
      expect(chunk.url.startsWith(`/${chunk.lang}/`), chunk.url).toBe(true)
    }
    const ids = chunks.map((chunk) => `${chunk.lang}:${chunk.id}`)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("links each field's help to the step its registry entry belongs to", () => {
    const areas = { quickCheck: "quick-check", businessPlan: "business-plan" } as const
    for (const moduleKey of ["quickCheck", "businessPlan"] as const) {
      for (const entry of [...fieldsOf({ module: moduleKey }), ...groupsOf({ module: moduleKey })]) {
        if (!entry.text.key.startsWith("fields.")) continue
        expect(stepOf(areas[moduleKey], entry.text.key.slice("fields.".length)), entry.id).toBe(entry.step)
      }
    }
  })

  it("puts every field help text of both modules into a chunk", () => {
    const all = chunks.map((chunk) => chunk.text).join("\n")
    for (const [dictionary, moduleKey] of [[en, "quickCheck"], [bp, "businessPlan"]] as const) {
      for (const entry of [...fieldsOf({ module: moduleKey }), ...groupsOf({ module: moduleKey })]) {
        const help = lookup(dictionary, `${entry.text.key}.help`)
        const label = lookup(dictionary, `${entry.text.key}.label`)
        if (typeof help === "string" && entry.text.key.startsWith("fields.")) expect(all, entry.id).toContain(`${label}: ${help}`)
      }
    }
  })

  it("names every result with a UI label, not a key", () => {
    for (const chunk of chunks.filter((entry) => entry.id.startsWith("calc:results."))) {
      const name = chunk.title.split(" · ").pop()!
      expect(name, chunk.id).not.toMatch(/\.|^[a-z]+[A-Z]/)
    }
  })

  it("packs lines into chunks of at most 1,200 characters, cutting long lines at a word", () => {
    const packed = packLines(["short", "word ".repeat(400).trim(), "end"])
    for (const chunk of packed) expect(chunk.length).toBeLessThanOrEqual(MAX_CHUNK)
    expect(packed.join(" ").split(/\s+/).filter((word: string) => word === "word")).toHaveLength(400)
  })
})

describe("public docs pages (phase A04)", () => {
  const page = [
    "---",
    'title: "Quick Check"',
    "---",
    'import { Note } from "./note"',
    "",
    "# Quick Check",
    "",
    "The **Quick Check** screens a site. See [the dashboard](/en/dashboard).",
    "",
    "## Inputs & results",
    "",
    "<Note>Enter the *project area* in m².</Note>",
    "",
    "```ts",
    "const hidden = true",
    "```",
    "",
    "## Wärme und Kälte",
    "",
    "Heating and cooling.",
  ].join("\n")

  it("splits a page at ## headings and strips MDX, JSX, code and link targets", () => {
    expect(mdxSections(page)).toEqual([
      { heading: null, anchor: null, text: "The Quick Check screens a site. See the dashboard." },
      { heading: "Inputs & results", anchor: "inputs-results", text: "Enter the project area in m²." },
      { heading: "Wärme und Kälte", anchor: "warme-und-kalte", text: "Heating and cooling." },
    ])
  })

  it("makes anchors from headings", () => {
    expect(slugify("Quick Check: inputs & results")).toBe("quick-check-inputs-results")
  })

  it("turns each section into a chunk linked to its anchor", () => {
    mkdirSync(path.join(temp, "content/docs/en"), { recursive: true })
    writeFileSync(path.join(temp, "content/docs/en/quick-check.mdx"), page)
    expect(docsChunks(temp, "en").map(({ id, title, url, source }: Record<string, string>) => ({ id, title, url, source }))).toEqual([
      { id: "docs:quick-check", title: "Quick Check", url: "/en/docs/quick-check", source: "content/docs/en/quick-check.mdx" },
      {
        id: "docs:quick-check#inputs-results",
        title: "Quick Check · Inputs & results",
        url: "/en/docs/quick-check#inputs-results",
        source: "content/docs/en/quick-check.mdx#inputs-results",
      },
      {
        id: "docs:quick-check#warme-und-kalte",
        title: "Quick Check · Wärme und Kälte",
        url: "/en/docs/quick-check#warme-und-kalte",
        source: "content/docs/en/quick-check.mdx#warme-und-kalte",
      },
    ])
    expect(docsChunks(temp, "de")).toEqual([])
  })
})

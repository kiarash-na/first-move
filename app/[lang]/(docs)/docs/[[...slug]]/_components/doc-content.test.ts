import { existsSync } from "node:fs"
import path from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import type { MDXContent } from "mdx/types"
import { DOC_SLUGS } from "@/lib/docs/pages"
import { contentLanguage, DOC_CONTENT, loadDocContent } from "./doc-content"

const root = path.resolve(__dirname, "../../../../../..")
const fake = (() => null) as unknown as MDXContent
const original = { en: { ...DOC_CONTENT.en }, de: { ...DOC_CONTENT.de } }

afterEach(() => {
  Object.assign(DOC_CONTENT.en, original.en)
  for (const key of Object.keys(DOC_CONTENT.de)) delete DOC_CONTENT.de[key as keyof typeof DOC_CONTENT.de]
  Object.assign(DOC_CONTENT.de, original.de)
})

describe("doc content", () => {
  it("has an English page for every slug, each with its MDX file", () => {
    expect(Object.keys(DOC_CONTENT.en)).toEqual(DOC_SLUGS)
    for (const slug of DOC_SLUGS) expect(existsSync(path.join(root, `content/docs/en/${slug}.mdx`)), slug).toBe(true)
  })

  it("has no German pages yet, so German shows English (D-32)", () => {
    expect(DOC_CONTENT.de).toEqual({})
    expect(contentLanguage("quick-check", "de")).toBe("en")
    expect(contentLanguage("quick-check", "en")).toBe("en")
  })

  it("loads the English page and reports the language it is shown in", async () => {
    DOC_CONTENT.en.index = async () => ({ default: fake })
    expect(await loadDocContent("index", "de")).toEqual({ Content: fake, lang: "en" })
  })

  it("loads a translated page in its own language", async () => {
    DOC_CONTENT.de["quick-check"] = async () => ({ default: fake })
    expect(contentLanguage("quick-check", "de")).toBe("de")
    expect(await loadDocContent("quick-check", "de")).toEqual({ Content: fake, lang: "de" })
  })
})

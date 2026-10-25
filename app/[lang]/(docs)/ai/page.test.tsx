// @vitest-environment node
import { describe, expect, it } from "vitest"

import en from "@/dictionaries/en/ai.json"
import { LegalDoc } from "../_components/legal/legal-doc"
import AiPage, { generateMetadata } from "./page"

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as PageProps<"/[lang]/ai">

describe("ai page", () => {
  it("titles the page from its document, per language", async () => {
    const meta = await generateMetadata(props("en"))
    expect(meta).toMatchObject({ title: en.meta.title, description: en.meta.description })
    expect(meta.alternates).toMatchObject({ canonical: "https://www.firstmove.energy/en/ai" })
    expect((await generateMetadata(props("de"))).title).toBeTruthy()
  })

  it("renders the shared legal document for its slug and language", async () => {
    const tree = await AiPage(props("de"))
    expect(tree.type).toBe(LegalDoc)
    expect(tree.props).toEqual({ slug: "ai", lang: "de" })
  })
})

// @vitest-environment node
import { describe, expect, it } from "vitest"

import en from "@/dictionaries/en/imprint.json"
import { LegalDoc } from "../_components/legal/legal-doc"
import ImprintPage, { generateMetadata } from "./page"

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as PageProps<"/[lang]/imprint">

describe("imprint page", () => {
  it("titles the page from its document, per language", async () => {
    const meta = await generateMetadata(props("en"))
    expect(meta).toMatchObject({ title: en.meta.title, description: en.meta.description })
    expect(meta.alternates).toMatchObject({ canonical: "https://www.firstmove.energy/en/imprint" })
    expect((await generateMetadata(props("de"))).title).toBeTruthy()
  })

  it("renders the shared legal document for its slug and language", async () => {
    const tree = await ImprintPage(props("de"))
    expect(tree.type).toBe(LegalDoc)
    expect(tree.props).toEqual({ slug: "imprint", lang: "de" })
  })
})

// @vitest-environment node
import { describe, expect, it } from "vitest"

import en from "@/dictionaries/en/privacy.json"
import { LegalDoc } from "../_components/legal/legal-doc"
import PrivacyPage, { generateMetadata } from "./page"

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as PageProps<"/[lang]/privacy">

describe("privacy page", () => {
  it("titles the page from its document, per language", async () => {
    const meta = await generateMetadata(props("en"))
    expect(meta).toMatchObject({ title: en.meta.title, description: en.meta.description })
    expect(meta.alternates).toMatchObject({ canonical: "https://www.firstmove.energy/en/privacy" })
    expect((await generateMetadata(props("de"))).title).toBeTruthy()
  })

  it("renders the shared legal document for its slug and language", async () => {
    const tree = await PrivacyPage(props("de"))
    expect(tree.type).toBe(LegalDoc)
    expect(tree.props).toEqual({ slug: "privacy", lang: "de" })
  })
})

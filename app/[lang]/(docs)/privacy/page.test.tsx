// @vitest-environment node
import { describe, expect, it } from "vitest"

import en from "@/dictionaries/en/privacy.json"
import { LegalDoc } from "../_components/legal/legal-doc"
import PrivacyPage, { generateMetadata } from "./page"

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as PageProps<"/[lang]/privacy">

describe("privacy page", () => {
  it("titles the page from its document, per language", async () => {
    expect(await generateMetadata(props("en"))).toEqual({ title: en.meta.title, description: en.meta.description })
    expect((await generateMetadata(props("de"))).title).toBeTruthy()
  })

  it("renders the shared legal document for its slug and language", async () => {
    const tree = await PrivacyPage(props("de"))
    expect(tree.type).toBe(LegalDoc)
    expect(tree.props).toEqual({ slug: "privacy", lang: "de" })
  })
})

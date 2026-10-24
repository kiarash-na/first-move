// @vitest-environment node
import { describe, expect, it } from "vitest"

import en from "@/dictionaries/en/license.json"
import { LegalDoc } from "../_components/legal/legal-doc"
import LicensePage, { generateMetadata } from "./page"

const props = (lang: string) => ({ params: Promise.resolve({ lang }) }) as PageProps<"/[lang]/license">

describe("license page", () => {
  it("titles the page from its document, per language", async () => {
    expect(await generateMetadata(props("en"))).toEqual({ title: en.meta.title, description: en.meta.description })
    expect((await generateMetadata(props("de"))).title).toBeTruthy()
  })

  it("renders the shared legal document for its slug and language", async () => {
    const tree = await LicensePage(props("de"))
    expect(tree.type).toBe(LegalDoc)
    expect(tree.props).toEqual({ slug: "license", lang: "de" })
  })
})

// @vitest-environment node
import type { ReactElement } from "react"
import { describe, expect, it, vi } from "vitest"

import enAi from "@/dictionaries/en/ai.json"
import enTerms from "@/dictionaries/en/terms.json"
import { AiProviders } from "./ai-providers"
import { LegalDoc, legalMetadata } from "./legal-doc"
import { LegalPage } from "./legal-page"
import { ThirdPartyTable } from "./third-party-table"

type PageElement = ReactElement<{
  doc: { title: string }
  lang: string
  status?: string
  after?: Record<string, ReactElement>
}>

const render = async (slug: Parameters<typeof LegalDoc>[0]["slug"], lang = "en") =>
  (await LegalDoc({ slug, lang })) as PageElement

describe("LegalDoc", () => {
  it("renders the document of the slug in the page language", async () => {
    const page = await render("terms", "de")
    expect(page.type).toBe(LegalPage)
    expect(page.props.lang).toBe("de")
    expect(page.props.doc.title).toBeTruthy()
    expect(page.props.status).toBeUndefined()
    expect(page.props.after).toBeUndefined()
  })

  it("shows the 'not available yet' status on the AI page while the features are off", async () => {
    const page = await render("ai")
    expect(page.props.status).toBe(enAi.status.planned)
    expect(page.props.after?.["how-it-runs"].type).toBe(AiProviders)
  })

  it("shows the 'live' status once the switch is on", async () => {
    vi.resetModules()
    vi.doMock("@/lib/legal/ai", () => ({ AI_FEATURES_LIVE: true, AI_PROVIDERS: [] }))
    const { LegalDoc: Live } = await import("./legal-doc")
    const page = (await Live({ slug: "ai", lang: "en" })) as PageElement
    expect(page.props.status).toBe(enAi.status.live)
    vi.doUnmock("@/lib/legal/ai")
  })

  it("adds the package table behind the third-party section of the Licence page", async () => {
    const page = await render("license")
    expect(page.props.after?.["third-party"].type).toBe(ThirdPartyTable)
  })

  it("answers an unknown language with not-found", async () => {
    await expect(LegalDoc({ slug: "terms", lang: "fr" })).rejects.toThrow()
  })
})

describe("legalMetadata", () => {
  it("takes title and description from the document's meta", async () => {
    expect(await legalMetadata("terms", "en")).toEqual({ title: enTerms.meta.title, description: enTerms.meta.description })
  })
})

// @vitest-environment node
import type { ReactElement } from "react"
import { describe, expect, it, vi } from "vitest"
import en from "@/dictionaries/en/docs.json"
import de from "@/dictionaries/de/docs.json"
import { DocsArticle } from "./_components/docs-article"
import { DocsNav } from "./_components/docs-nav"
import DocsPage, { ensureStatic, generateMetadata, generateStaticParams, instant } from "./page"

/** The off path; `e2e/docs.spec.ts` covers the live one, and `lib/docs/pages.test.ts` both. */
vi.mock("@/lib/legal/ai", async (original) => ({ ...(await original<typeof import("@/lib/legal/ai")>()), AI_FEATURES_LIVE: false }))

/** What `notFound()` throws; any other error would fail these tests. */
const NOT_FOUND = { digest: "NEXT_HTTP_ERROR_FALLBACK;404" }

const props = (lang: string, slug?: string[]) =>
  ({ params: Promise.resolve({ lang, slug }) }) as PageProps<"/[lang]/docs/[[...slug]]">

type Element = ReactElement<{ children: Element | Element[] } & Record<string, unknown>>

describe("docs page (PLAN-AGENT-04)", () => {
  it("prerenders the visible pages, without the AI pages while the AI features are off", () => {
    expect(generateStaticParams()).toEqual([
      { slug: [] },
      { slug: ["what-is-5gdhc"] },
      { slug: ["quick-check"] },
      { slug: ["business-plan"] },
      { slug: ["ai-plan-score"] },
      { slug: ["reference-cases"] },
      { slug: ["data-and-privacy"] },
    ])
  })

  it("waits for the complete static page, so an unknown slug answers 404", () => {
    expect(ensureStatic).toBe("navigation")
    expect(instant).toBe(false)
  })

  it("titles each page from the docs dictionary, with canonical, hreflang and cards", async () => {
    const BASE = "https://www.firstmove.energy"
    expect(await generateMetadata(props("en"))).toEqual({
      title: en.pages.index.title,
      description: en.pages.index.description,
      metadataBase: new URL(BASE),
      alternates: {
        canonical: `${BASE}/en/docs`,
        languages: { en: `${BASE}/en/docs`, de: `${BASE}/de/docs`, "x-default": `${BASE}/de/docs` },
      },
      openGraph: { type: "website", siteName: "First Move", url: `${BASE}/en/docs`, locale: "en_US", alternateLocale: "de_DE" },
      twitter: { card: "summary_large_image" },
    })
    expect(await generateMetadata(props("de", ["data-and-privacy"]))).toMatchObject({
      title: de.pages["data-and-privacy"].title,
      description: de.pages["data-and-privacy"].description,
      alternates: { canonical: `${BASE}/de/docs/data-and-privacy` },
      openGraph: { locale: "de_DE", alternateLocale: "en_US" },
    })
    expect(de.pages["data-and-privacy"].title).not.toBe(en.pages["data-and-privacy"].title)
  })

  it("adds no metadata for a page that answers 404", async () => {
    expect(await generateMetadata(props("en", ["assistant"]))).toEqual({})
    expect(await generateMetadata(props("en", ["missing"]))).toEqual({})
  })

  it("renders the page list and the article of the slug", async () => {
    const main = (await DocsPage(props("de", ["quick-check"]))) as Element
    expect(main.type).toBe("main")
    const [nav, article] = (main.props.children as Element).props.children as Element[]
    expect(nav.type).toBe(DocsNav)
    expect(nav.props).toMatchObject({ lang: "de", current: "quick-check", live: false, copy: { nav: { title: de.nav.title } } })
    expect(article.type).toBe(DocsArticle)
    expect(article.props).toMatchObject({ slug: "quick-check", lang: "de", live: false })
  })

  it("renders the index without a slug", async () => {
    const main = (await DocsPage(props("en"))) as Element
    const [nav, article] = (main.props.children as Element).props.children as Element[]
    expect(nav.props).toMatchObject({ current: "index" })
    expect(article.props).toMatchObject({ slug: "index", lang: "en" })
  })

  it("answers 404 for an unknown slug and for the AI pages while the AI features are off", async () => {
    await expect(DocsPage(props("en", ["missing"]))).rejects.toMatchObject(NOT_FOUND)
    await expect(DocsPage(props("en", ["assistant"]))).rejects.toMatchObject(NOT_FOUND)
    await expect(DocsPage(props("en", ["email-agent"]))).rejects.toMatchObject(NOT_FOUND)
    await expect(DocsPage(props("en", ["quick-check", "extra"]))).rejects.toMatchObject(NOT_FOUND)
  })
})

// @vitest-environment node
import type { ReactElement } from "react"
import { describe, expect, it } from "vitest"
import en from "@/dictionaries/en/docs.json"
import de from "@/dictionaries/de/docs.json"
import { DocsArticle } from "./_components/docs-article"
import { DocsNav } from "./_components/docs-nav"
import DocsPage, { ensureStatic, generateMetadata, generateStaticParams, instant } from "./page"

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
      { slug: ["data-and-privacy"] },
    ])
  })

  it("waits for the complete static page, so an unknown slug answers 404", () => {
    expect(ensureStatic).toBe("navigation")
    expect(instant).toBe(false)
  })

  it("titles each page from the docs dictionary", async () => {
    expect(await generateMetadata(props("en"))).toEqual({ title: en.pages.index.title, description: en.pages.index.description })
    expect(await generateMetadata(props("de", ["quick-check"]))).toEqual({
      title: en.pages["quick-check"].title,
      description: en.pages["quick-check"].description,
    })
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
    await expect(DocsPage(props("en", ["missing"]))).rejects.toThrow()
    await expect(DocsPage(props("en", ["assistant"]))).rejects.toThrow()
    await expect(DocsPage(props("en", ["email-agent"]))).rejects.toThrow()
    await expect(DocsPage(props("en", ["quick-check", "extra"]))).rejects.toThrow()
  })
})

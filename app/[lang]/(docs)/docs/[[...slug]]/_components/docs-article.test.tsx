import { render, screen } from "@testing-library/react"
import type { MDXProps } from "mdx/types"
import { afterEach, describe, expect, it, vi } from "vitest"
import de from "@/dictionaries/de/docs.json"
import en from "@/dictionaries/en/docs.json"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { DocsArticle } from "./docs-article"

const received: MDXProps[] = []

/** Whether the mocked page has no German file, so a German route falls back to English. */
const content = vi.hoisted(() => ({ englishOnly: false }))

function FakeContent(props: MDXProps) {
  received.push(props)
  return <h1>Fake page</h1>
}

vi.mock("./doc-content", () => ({
  loadDocContent: async (_slug: string, lang: string) => ({ Content: FakeContent, lang: content.englishOnly ? "en" : lang }),
}))

afterEach(() => {
  content.englishOnly = false
})

describe("DocsArticle", () => {
  it("renders the page content with the docs components and the pager", async () => {
    render(await DocsArticle({ slug: "quick-check", lang: "en", copy: en, live: false }))
    expect(screen.getByRole("heading", { level: 1, name: "Fake page" })).toBeInTheDocument()
    expect(screen.queryByRole("note")).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 1 }).parentElement).not.toHaveAttribute("lang")
    expect(Object.keys(received.at(-1)?.components ?? {})).toEqual(expect.arrayContaining(["h1", "h2", "a", "AiOnly"]))
    const pager = screen.getByRole("navigation", { name: en.pager.label })
    expect(pager).toContainElement(screen.getByRole("link", { name: `${en.pager.next} ${en.pages["business-plan"].title}` }))
  })

  it("shows the German page on a German route, without a note or a lang attribute", async () => {
    render(await DocsArticle({ slug: "quick-check", lang: "de", copy: await getDictionary("de", "docs"), live: false }))
    expect(screen.queryByRole("note")).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 1 }).parentElement).not.toHaveAttribute("lang")
    const pager = screen.getByRole("navigation", { name: de.pager.label })
    expect(pager).toContainElement(screen.getByRole("link", { name: `${de.pager.next} ${de.pages["business-plan"].title}` }))
  })

  it("shows the English page on a German route when the page has no German file, with a note and lang=en", async () => {
    content.englishOnly = true
    render(await DocsArticle({ slug: "index", lang: "de", copy: en, live: false }))
    expect(screen.getByRole("note")).toHaveTextContent(en.page.englishOnly)
    expect(screen.getByRole("heading", { level: 1 }).parentElement).toHaveAttribute("lang", "en")
  })

  it("writes that note in German, as only German readers see it", async () => {
    content.englishOnly = true
    render(await DocsArticle({ slug: "index", lang: "de", copy: await getDictionary("de", "docs"), live: false }))
    expect(screen.getByRole("note")).toHaveTextContent(de.page.englishOnly)
    expect(de.page.englishOnly).not.toBe(en.page.englishOnly)
  })
})

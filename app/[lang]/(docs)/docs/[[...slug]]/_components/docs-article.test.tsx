import { render, screen } from "@testing-library/react"
import type { MDXProps } from "mdx/types"
import { describe, expect, it, vi } from "vitest"
import de from "@/dictionaries/de/docs.json"
import en from "@/dictionaries/en/docs.json"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { DocsArticle } from "./docs-article"

const received: MDXProps[] = []

function FakeContent(props: MDXProps) {
  received.push(props)
  return <h1>Fake page</h1>
}

vi.mock("./doc-content", () => ({
  loadDocContent: async (_slug: string, lang: string) => ({ Content: FakeContent, lang: lang === "de" ? "en" : lang }),
}))

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

  it("shows the English page on a German route, with a note and lang=en on the content", async () => {
    render(await DocsArticle({ slug: "index", lang: "de", copy: en, live: false }))
    expect(screen.getByRole("note")).toHaveTextContent(en.page.englishOnly)
    expect(screen.getByRole("heading", { level: 1 }).parentElement).toHaveAttribute("lang", "en")
  })

  it("writes that note in German, as only German readers see it", async () => {
    render(await DocsArticle({ slug: "index", lang: "de", copy: await getDictionary("de", "docs"), live: false }))
    expect(screen.getByRole("note")).toHaveTextContent(de.page.englishOnly)
    expect(de.page.englishOnly).not.toBe(en.page.englishOnly)
  })
})

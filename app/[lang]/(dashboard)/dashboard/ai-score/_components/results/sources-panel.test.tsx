import { screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { REFERENCES } from "@/lib/docs/references"
import { SourcesPanel } from "./sources-panel"
import { aiScoreCopy, renderResults } from "./test-utils/render"

describe("SourcesPanel", () => {
  it("lists every verified method reference with its link, and only those", () => {
    const copy = aiScoreCopy("en").results.sources
    renderResults(<SourcesPanel />)
    const method = screen.getByRole("region", { name: copy.method })
    const links = within(method).getAllByRole("link")
    expect(links.map((link) => link.getAttribute("href"))).toEqual(REFERENCES.map((reference) => reference.url))
    for (const link of links) expect(link).toHaveAttribute("rel", "noopener noreferrer")
    expect(screen.getByRole("region", { name: copy.provider })).toBeInTheDocument()
  })

  it.each(["en", "de"] as const)("links to the public docs page (%s)", (lang) => {
    renderResults(<SourcesPanel />, { lang })
    expect(screen.getByRole("link", { name: aiScoreCopy(lang).results.sources.docs })).toHaveAttribute("href", `/${lang}/docs/ai-plan-score`)
  })
})

import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { REFERENCES } from "@/lib/docs/references"
import { SourcesPanel } from "./sources-panel"
import { aiScoreCopy, renderResults } from "./test-utils/render"

describe("SourcesPanel", () => {
  it("shows the provider sources and lists every verified method reference on request, and only those", async () => {
    const copy = aiScoreCopy("en").results.sources
    renderResults(<SourcesPanel />)
    expect(screen.getByRole("region", { name: copy.provider })).toBeInTheDocument()
    const method = screen.getByRole("region", { name: copy.method })
    expect(within(method).queryAllByRole("link")).toHaveLength(0)
    await userEvent.click(within(method).getByRole("button", { name: `Show all ${REFERENCES.length} references` }))
    const links = within(method).getAllByRole("link")
    expect(links.map((link) => link.getAttribute("href"))).toEqual(REFERENCES.map((reference) => reference.url))
    for (const link of links) expect(link).toHaveAttribute("rel", "noopener noreferrer")
  })

  it.each(["en", "de"] as const)("links to the public docs page (%s)", (lang) => {
    renderResults(<SourcesPanel />, { lang })
    expect(screen.getByRole("link", { name: aiScoreCopy(lang).results.sources.docs })).toHaveAttribute("href", `/${lang}/docs/ai-plan-score`)
  })
})

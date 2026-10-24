import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { exampleCards } from "@/lib/dashboard/example-cards"
import { I18nProvider } from "../_components/i18n-provider"
import { testDictionaries } from "../_components/test-utils/dictionaries"
import { ExampleCard } from "./example-card"

describe("ExampleCard (D-04)", () => {
  it.each(["en", "de"] as const)("shows scenario, facts, verdict and the illustrative label (%s)", async (lang) => {
    const [card] = exampleCards(lang)
    const onOpen = vi.fn()
    const copy = testDictionaries(lang)
    render(
      <I18nProvider lang={lang} dictionaries={copy}>
        <ExampleCard example={card} busy={false} onOpen={onOpen} />
      </I18nProvider>,
    )
    const article = screen.getByRole("article", { name: card.name })
    expect(article).toHaveTextContent(copy["business-plan"].scenarios["BM-SCN-01"].label)
    expect(article).toHaveTextContent(copy.start.examples.illustrative)
    expect(article).toHaveTextContent(copy["quick-check"].results.levels.not_promising.label)
    expect(article).toHaveTextContent("45 buildings · 150 ha")
    await userEvent.click(screen.getByRole("button", { name: new RegExp(copy.start.examples.open) }))
    expect(onOpen).toHaveBeenCalledWith(card.id)
  })

  it("labels extra examples and forced verdicts", () => {
    const cards = exampleCards("en")
    const spa = cards.find((card) => card.forced)!
    const extra = cards.find((card) => card.scenarioId === "custom")!
    const { start } = testDictionaries()
    render(
      <I18nProvider lang="en" dictionaries={testDictionaries()}>
        <ExampleCard example={spa} busy onOpen={() => {}} />
        <ExampleCard example={extra} busy={false} onOpen={() => {}} />
      </I18nProvider>,
    )
    expect(screen.getByRole("article", { name: spa.name })).toHaveTextContent(start.examples.forced)
    expect(screen.getByRole("article", { name: extra.name })).toHaveTextContent(start.examples.extra)
  })
})

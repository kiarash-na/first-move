import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { I18nProvider } from "../i18n-provider"
import { testDictionaries } from "../test-utils/dictionaries"
import { UnknownSourcesNote } from "./unknown-sources-note"

describe("UnknownSourcesNote (QCT-KF-06)", () => {
  it("names the sources to clarify and links to the sources step", () => {
    const quickCheck = testDictionaries("de")["quick-check"]
    render(
      <I18nProvider lang="de" dictionaries={testDictionaries("de")}>
        <UnknownSourcesNote sources={["geothermal", "surface_water"]} />
      </I18nProvider>,
    )
    expect(screen.getByRole("heading", { name: quickCheck.ui.results.unknown.title })).toBeInTheDocument()
    expect(screen.getByText(/Das Potenzial von Geothermie und Oberflächenwasser ist unbekannt/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: quickCheck.ui.results.unknown.action })).toHaveAttribute("href", "/de/dashboard/quick-check/sources")
  })
})

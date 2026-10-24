import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import { I18nProvider } from "./i18n-provider"
import { testDictionaries } from "./test-utils/dictionaries"
import { MissingSteps } from "./missing-steps"

describe("MissingSteps (R-03)", () => {
  it("links every incomplete step", () => {
    render(
      <I18nProvider lang="de" dictionaries={testDictionaries("de")}>
        <MissingSteps steps={["buildings", "sources", "assumptions", "project"]} />
      </I18nProvider>,
    )
    const links = screen.getAllByRole("link")
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/de/dashboard/quick-check/buildings",
      "/de/dashboard/quick-check/sources",
      "/de/dashboard/assumptions",
    ])
    expect(links[0]).toHaveTextContent(shell.nav.items.quickCheck.buildings)
  })
})

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { I18nProvider } from "../../../_components/i18n-provider"
import { testDictionaries } from "../../../_components/test-utils/dictionaries"
import { ScreeningNote } from "./screening-note"

describe("ScreeningNote (QCT-SCOPE-07/08)", () => {
  it("says the result is a screening", () => {
    render(
      <I18nProvider lang="en" dictionaries={testDictionaries("en")}>
        <ScreeningNote />
      </I18nProvider>,
    )
    expect(screen.getByText(quickCheck.ui.results.screening.title)).toBeInTheDocument()
    expect(screen.getByText(quickCheck.ui.results.screening.body)).toBeInTheDocument()
  })

  it("is a complementary landmark named by its title", () => {
    render(
      <I18nProvider lang="en" dictionaries={testDictionaries("en")}>
        <ScreeningNote />
      </I18nProvider>,
    )
    expect(screen.getByRole("complementary", { name: quickCheck.ui.results.screening.title })).toBeInTheDocument()
  })
})

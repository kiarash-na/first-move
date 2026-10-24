import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import calc from "@/dictionaries/en/calc.json"
import { RESULT_EXPLAIN } from "@/lib/quick-check"
import { I18nProvider } from "../i18n-provider"
import { testDictionaries } from "../test-utils/dictionaries"
import { CalcInfo } from "./calc-info"

describe("CalcInfo (D-33)", () => {
  it.each(["en", "de"] as const)("opens a popover with the explanation of a value (%s)", async (lang) => {
    render(
      <I18nProvider lang={lang} dictionaries={testDictionaries(lang)}>
        <CalcInfo source={RESULT_EXPLAIN.buildingDensity} label="Building density" />
      </I18nProvider>,
    )
    const dictionary = testDictionaries(lang).calc
    await userEvent.click(screen.getByRole("button", { name: `${dictionary.ui.info}: Building density` }))
    const panel = screen.getByRole("dialog", { name: dictionary.ui.title })
    expect(panel).toHaveTextContent(calc.results.buildingDensity.text)
    expect(panel).toHaveTextContent("EQ-3.3")
  })

  it("has a generic name without a label", () => {
    render(
      <I18nProvider lang="en" dictionaries={testDictionaries("en")}>
        <CalcInfo source={{ formulas: ["EQ-3.5"] }} />
      </I18nProvider>,
    )
    expect(screen.getByRole("button", { name: calc.ui.info })).toBeInTheDocument()
  })
})

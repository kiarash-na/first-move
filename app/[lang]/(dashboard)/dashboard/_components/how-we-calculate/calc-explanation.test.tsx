import { render, screen } from "@testing-library/react"
import type { ReactElement } from "react"
import { describe, expect, it } from "vitest"
import calc from "@/dictionaries/en/calc.json"
import { STEP_EXPLAIN, explainResult, type QuickCheckFlags } from "@/lib/quick-check"
import { I18nProvider } from "../i18n-provider"
import { testDictionaries } from "../test-utils/dictionaries"
import { CalcExplanation } from "./calc-explanation"

const NO_FLAGS: QuickCheckFlags = {
  incomplete: false,
  manualHeatingDemand: false,
  manualCoolingDemand: false,
  manualNetworkLength: false,
  estimatedNetworkLength: true,
  customParameters: false,
  pv: false,
  industry: false,
  unknownSources: false,
}

function renderIn(lang: "en" | "de", ui: ReactElement) {
  return render(
    <I18nProvider lang={lang} dictionaries={testDictionaries(lang)}>
      {ui}
    </I18nProvider>,
  )
}

describe("CalcExplanation (D-33)", () => {
  it.each(["en", "de"] as const)("shows the sentence, every formula with its ID and name, and the tables (%s)", (lang) => {
    const { container } = renderIn(lang, <CalcExplanation source={STEP_EXPLAIN.area} />)
    expect(screen.getByText(calc.steps.area)).toBeInTheDocument()
    const items = screen.getAllByRole("listitem")
    expect(items.map((item) => item.querySelector("span")?.textContent)).toEqual([...STEP_EXPLAIN.area.formulas])
    expect(screen.getByText(calc.formulas["eq-03-04a"])).toBeInTheDocument()
    expect(container.querySelectorAll("math").length).toBe(STEP_EXPLAIN.area.formulas.length)
    expect(screen.getByText(`${calc.ui.tables} · TBL-8`)).toBeInTheDocument()
  })

  it("explains a value without an equation and lists the resolved formula after it", () => {
    renderIn("en", <CalcExplanation source={explainResult("chRatio", NO_FLAGS)} />)
    expect(screen.getByText(calc.ui.noEquation)).toBeInTheDocument()
    expect(screen.getByText("OQ-12")).toBeInTheDocument()
  })

  it("works with formulas only", () => {
    renderIn("en", <CalcExplanation source={{ formulas: ["EQ-3.3"] }} />)
    expect(screen.getByText("EQ-3.3")).toBeInTheDocument()
    expect(screen.queryByText(calc.ui.tables, { exact: false })).not.toBeInTheDocument()
  })
})

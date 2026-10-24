import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import calc from "@/dictionaries/en/calc.json"
import { STEP_EXPLAIN } from "@/lib/quick-check"
import { I18nProvider } from "../i18n-provider"
import { testDictionaries } from "../test-utils/dictionaries"
import { CalcExplanationSkeleton, LazyCalcExplanation, preloadCalcExplanation } from "./lazy-calc-explanation"

describe("LazyCalcExplanation", () => {
  it("renders the explanation with its MathML once the module has loaded", async () => {
    preloadCalcExplanation()
    const { container } = render(
      <I18nProvider lang="en" dictionaries={testDictionaries("en")}>
        <LazyCalcExplanation source={STEP_EXPLAIN.area} />
      </I18nProvider>,
    )
    expect(await screen.findByText(calc.steps.area)).toBeInTheDocument()
    expect(container.querySelectorAll("math").length).toBe(STEP_EXPLAIN.area.formulas.length)
    expect(container.querySelector('[data-slot="calc-explanation-loading"]')).toBeNull()
  })

  it("has a text-free loading state that is marked busy", () => {
    const { container } = render(<CalcExplanationSkeleton />)
    const loading = container.querySelector('[data-slot="calc-explanation-loading"]')
    expect(loading).toHaveAttribute("aria-busy", "true")
    expect(loading).toHaveTextContent("")
  })
})

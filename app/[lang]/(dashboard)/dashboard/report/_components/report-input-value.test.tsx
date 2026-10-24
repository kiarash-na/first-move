import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { I18nProvider } from "../../_components/i18n-provider"
import { testDictionaries } from "../../_components/test-utils/dictionaries"
import { ReportInputValue } from "./report-input-value"
import type { ReportValue } from "@/lib/report/quick-check-inputs"

const show = (value: ReportValue, lang: "en" | "de" = "en") =>
  render(
    <I18nProvider lang={lang} dictionaries={testDictionaries(lang)}>
      <p data-testid="value">
        <ReportInputValue value={value} />
      </p>
    </I18nProvider>,
  )

const text = () => screen.getByTestId("value").textContent?.replace(/ | /g, " ")

describe("ReportInputValue", () => {
  it("prints an area in m² with its hectares, in the page language", () => {
    show({ kind: "number", value: 1_500_000, unit: "m²", hectares: true })
    expect(text()).toBe("1,500,000 m² (150 ha)")
  })

  it("prints counts, shares and yes or no", () => {
    show({ kind: "number", value: 45, hectares: false })
    expect(text()).toBe("45")
    show({ kind: "percent", value: 37.5 })
    expect(screen.getAllByTestId("value")[1].textContent).toBe("37.5%")
    show({ kind: "boolean", value: false })
    expect(screen.getAllByTestId("value")[2].textContent).toBe(testDictionaries().report.inputs.no)
  })

  it("names a chosen option and says what an empty value means", () => {
    const { report, "quick-check": quickCheck } = testDictionaries()
    show({ kind: "choice", option: { area: "quick-check", key: "potentials.high.label" } })
    expect(text()).toBe(quickCheck.potentials.high.label)
    show({ kind: "empty", means: "estimated" })
    expect(screen.getAllByTestId("value")[1].textContent).toBe(report.inputs.empty.estimated)
  })
})

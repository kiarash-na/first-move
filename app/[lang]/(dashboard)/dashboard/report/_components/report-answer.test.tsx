import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { ReportAnswer as Answer } from "@/lib/report/business-plan-entries"
import { I18nProvider } from "../../_components/i18n-provider"
import { testDictionaries } from "../../_components/test-utils/dictionaries"
import { ReportAnswer } from "./report-answer"

const show = (answer: Answer) =>
  render(
    <I18nProvider lang="en" dictionaries={testDictionaries("en")}>
      <ReportAnswer answer={answer} />
    </I18nProvider>,
  )

describe("ReportAnswer (D-27: as written)", () => {
  it("keeps the line breaks of a text", () => {
    show({ kind: "text", text: " First line\nsecond line " })
    const paragraph = screen.getByText(/First line/)
    expect(paragraph.textContent).toBe("First line\nsecond line")
    expect(paragraph).toHaveClass("whitespace-pre-line")
  })

  it("prints a list as a list and a chosen use case by its name", () => {
    show({ kind: "list", items: ["Municipality", "Cooperative"] })
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual(["Municipality", "Cooperative"])
    const { "business-plan": businessPlan } = testDictionaries()
    show({ kind: "choice", option: { area: "business-plan", key: "scenarios.BM-SCN-01.label" } })
    expect(screen.getByText(businessPlan.scenarios["BM-SCN-01"].label)).toBeInTheDocument()
  })

  it("numbers the rows and names every property, with a set flag as yes", () => {
    const { "business-plan": businessPlan, report } = testDictionaries()
    show({
      kind: "rows",
      rows: [
        {
          id: "r1",
          cells: [
            { label: { area: "business-plan", key: "fields.businessPlan.risks.item.title.label" }, value: "Permits" },
            { label: { area: "business-plan", key: "fields.businessPlan.risks.item.dealBreaker.label" }, value: true },
          ],
        },
      ],
    })
    expect(screen.getByText("Entry 1")).toBeInTheDocument()
    expect(screen.getByText(businessPlan.fields.businessPlan.risks.item.title.label)).toBeInTheDocument()
    expect(screen.getByText("Permits")).toBeInTheDocument()
    expect(screen.getByText(report.inputs.yes)).toBeInTheDocument()
  })
})

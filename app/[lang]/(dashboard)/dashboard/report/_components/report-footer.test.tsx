import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { I18nProvider } from "../../_components/i18n-provider"
import { testDictionaries } from "../../_components/test-utils/dictionaries"
import { ReportFooter } from "./report-footer"

describe("ReportFooter", () => {
  it("says it is a screening and where and when it was made", () => {
    render(
      <I18nProvider lang="en" dictionaries={testDictionaries("en")}>
        <ReportFooter created="2026-10-24T09:00:00.000Z" />
      </I18nProvider>,
    )
    const { "quick-check": quickCheck } = testDictionaries()
    expect(screen.getByText(`${quickCheck.ui.results.screening.title}.`)).toBeInTheDocument()
    expect(screen.getByText("Created with First Move (firstmove.energy) on 24 Oct 2026.")).toBeInTheDocument()
  })
})

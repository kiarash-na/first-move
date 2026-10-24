import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { testDictionaries } from "../test-utils/dictionaries"
import { fakeStore } from "../test-utils/fake-store"
import { renderDashboard } from "../test-utils/render"
import { ReportButton } from "./report-button"

describe("ReportButton (D-09)", () => {
  it.each(["en", "de"] as const)("is shown but disabled, with a coming-soon tooltip (%s)", async (lang) => {
    const { shell } = testDictionaries(lang)
    renderDashboard(<ReportButton />, { store: fakeStore().store, lang })
    const button = screen.getByRole("button", { name: `${shell.topBar.report}: ${shell.topBar.reportSoon}` })
    expect(button).toHaveAttribute("aria-disabled", "true")
    await userEvent.hover(button)
    expect(await screen.findByRole("tooltip")).toHaveTextContent(shell.topBar.reportSoon)
  })
})

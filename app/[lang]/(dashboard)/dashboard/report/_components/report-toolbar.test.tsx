import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { testDictionaries } from "../../_components/test-utils/dictionaries"
import { fakeStore } from "../../_components/test-utils/fake-store"
import { renderDashboard } from "../../_components/test-utils/render"
import { ReportToolbar } from "./report-toolbar"

describe("ReportToolbar (D-70)", () => {
  it.each(["en", "de"] as const)("goes back to the overview and opens the print dialog, and stays off paper (%s)", async (lang) => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {})
    renderDashboard(<ReportToolbar />, { store: fakeStore().store, lang })
    const { report } = testDictionaries(lang)
    const toolbar = screen.getByRole("toolbar", { name: report.toolbar.label })
    expect(toolbar).toHaveClass("print:hidden")
    expect(screen.getByRole("link", { name: report.toolbar.back })).toHaveAttribute("href", `/${lang}/dashboard/overview`)
    expect(screen.getByText(report.toolbar.hint)).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: report.toolbar.print }))
    expect(print).toHaveBeenCalledOnce()
    print.mockRestore()
  })
})

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import type { ShareSum } from "@/lib/dashboard/share-sum"
import { I18nProvider } from "../../../../_components/i18n-provider"
import { testDictionaries } from "../../../../_components/test-utils/dictionaries"
import { ShareSumBar } from "./share-sum-bar"

const sum = (value: number, state: ShareSum["state"]): ShareSum => ({ sum: value, state, remaining: 100 - value, rows: {}, columns: {} })

const renderBar = (value: ShareSum, lang: "en" | "de" = "en", onClear = vi.fn()) =>
  render(
    <I18nProvider lang={lang} dictionaries={testDictionaries(lang)}>
      <ShareSumBar sum={value} onClear={onClear} />
    </I18nProvider>,
  )

describe("ShareSumBar (R-03)", () => {
  it.each([
    [sum(0, "empty"), quickCheck.ui.buildings.state.empty],
    [sum(62.5, "under"), "37.5% still to assign"],
    [sum(100, "exact"), quickCheck.ui.buildings.state.exact],
    [sum(120, "over"), "20% too much. Reduce the shares to 100 %."],
  ])("says what to do (%#)", (value, message) => {
    renderBar(value)
    expect(screen.getByRole("status")).toHaveTextContent(message)
  })

  it("formats per language and clears on request", async () => {
    const onClear = vi.fn()
    renderBar(sum(62.5, "under"), "de", onClear)
    expect(screen.getByText("62,5 %")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: testDictionaries("de")["quick-check"].ui.buildings.clear }))
    expect(onClear).toHaveBeenCalledOnce()
  })
})

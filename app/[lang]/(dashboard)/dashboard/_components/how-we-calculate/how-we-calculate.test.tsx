import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import calc from "@/dictionaries/en/calc.json"
import calcDe from "@/dictionaries/de/calc.json"
import { STEP_EXPLAIN } from "@/lib/quick-check"
import { I18nProvider } from "../i18n-provider"
import { testDictionaries } from "../test-utils/dictionaries"
import { HowWeCalculate } from "./how-we-calculate"

describe("HowWeCalculate (D-33)", () => {
  it("is collapsed by default and opens on click", async () => {
    render(
      <I18nProvider lang="en" dictionaries={testDictionaries("en")}>
        <HowWeCalculate source={STEP_EXPLAIN.buildings} />
      </I18nProvider>,
    )
    const trigger = screen.getByRole("button", { name: calc.ui.title })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByText(calc.steps.buildings)).not.toBeInTheDocument()
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText(calc.steps.buildings)).toBeVisible()
    expect(screen.getByText("EQ-3.2c")).toBeVisible()
  })

  it("uses the DE title where present and the orange rule for Business Plan", async () => {
    const { container } = render(
      <I18nProvider lang="de" dictionaries={testDictionaries("de")}>
        <HowWeCalculate source={STEP_EXPLAIN.sources} tone="hot" />
      </I18nProvider>,
    )
    await userEvent.click(screen.getByRole("button", { name: calcDe.ui.title }))
    expect(container.querySelector(".border-hot")).not.toBeNull()
  })
})

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import quickCheck from "@/dictionaries/en/quick-check.json"
import { I18nProvider } from "../../_components/i18n-provider"
import { testDictionaries } from "../../_components/test-utils/dictionaries"
import { EffectMark } from "./effect-mark"

const renderMark = (effect: "supporting" | "limiting" | null) =>
  render(
    <I18nProvider lang="en" dictionaries={testDictionaries("en")}>
      <EffectMark effect={effect} />
    </I18nProvider>,
  )

describe("EffectMark", () => {
  it("names the effect for screen readers and marks it with colour and icon", () => {
    const { container } = renderMark("limiting")
    expect(screen.getByText(quickCheck.ui.results.drivers.limiting)).toHaveClass("sr-only")
    expect(container.querySelector("[data-effect=limiting]")).toHaveClass("text-hot")
  })

  it("is neutral without an effect", () => {
    const { container } = renderMark(null)
    expect(container.querySelector("[data-effect=none] .sr-only")).toBeNull()
  })
})

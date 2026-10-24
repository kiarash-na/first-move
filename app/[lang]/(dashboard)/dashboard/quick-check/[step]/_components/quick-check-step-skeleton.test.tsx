import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import { I18nProvider } from "../../../_components/i18n-provider"
import { QuickCheckStepSkeleton } from "./quick-check-step-skeleton"

describe("QuickCheckStepSkeleton", () => {
  it("shows a hidden header placeholder and the gate's labelled skeleton", () => {
    const { container } = render(
      <I18nProvider lang="en" dictionaries={{ shell }}>
        <QuickCheckStepSkeleton />
      </I18nProvider>,
    )
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByLabelText(shell.loading)).toHaveAttribute("aria-busy", "true")
  })
})

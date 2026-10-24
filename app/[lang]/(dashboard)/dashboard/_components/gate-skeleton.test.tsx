import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import shell from "@/dictionaries/en/shell.json"
import { GateSkeleton } from "./gate-skeleton"
import { I18nProvider } from "./i18n-provider"

describe("GateSkeleton", () => {
  it("is the page skeleton labelled with the shell's loading copy", () => {
    render(
      <I18nProvider lang="en" dictionaries={{ shell }}>
        <GateSkeleton />
      </I18nProvider>,
    )
    expect(screen.getByLabelText(shell.loading)).toHaveAttribute("aria-busy", "true")
  })
})

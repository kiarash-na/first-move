import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AiBadge } from "./ai-badge"
import { aiScoreCopy, renderResults } from "./test-utils/render"

describe("AiBadge", () => {
  it.each(["en", "de"] as const)("says the content is AI-generated (%s)", (lang) => {
    renderResults(<AiBadge />, { lang })
    expect(screen.getByText(aiScoreCopy(lang).results.aiGenerated)).toHaveAttribute("data-slot", "ai-badge")
  })
})

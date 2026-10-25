import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AiHint } from "./ai-hint"
import { aiScoreCopy, mockActions, renderResults } from "./test-utils/render"

describe("AiHint", () => {
  it("says nothing while AI can write", () => {
    const { container } = renderResults(<AiHint actions={mockActions()} />)
    expect(container.querySelector("[data-slot=ai-hint]")).toBeNull()
  })

  it.each(["en", "de"] as const)("asks for a key and a text model when none is ready (%s)", (lang) => {
    renderResults(<AiHint actions={mockActions({ canUseAi: false })} />, { lang })
    expect(screen.getByText(aiScoreCopy(lang).results.needsAi)).toHaveAttribute("data-reason", "setup")
  })

  it.each(["en", "de"] as const)("says a run is in progress instead of asking for a key during a run (%s)", (lang) => {
    const copy = aiScoreCopy(lang).results
    renderResults(<AiHint actions={mockActions({ canUseAi: false, running: true })} />, { lang })
    expect(screen.getByText(copy.runInProgress)).toHaveAttribute("data-reason", "running")
    expect(screen.queryByText(copy.needsAi)).not.toBeInTheDocument()
  })
})

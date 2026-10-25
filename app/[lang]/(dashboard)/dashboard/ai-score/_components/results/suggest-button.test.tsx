import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { SuggestButton } from "./suggest-button"
import { aiScoreCopy, mockActions, renderResults } from "./test-utils/render"

describe("SuggestButton (D-77)", () => {
  it("asks for suggestions for its keys", async () => {
    const actions = mockActions()
    renderResults(<SuggestButton actions={actions} keys={["pain-point"]} label="Suggest" name="Suggest improvements for Key pain point" />)
    await userEvent.click(screen.getByRole("button", { name: "Suggest improvements for Key pain point" }))
    expect(actions.suggest).toHaveBeenCalledWith(["pain-point"])
  })

  it("asks for every weak part without keys", async () => {
    const actions = mockActions()
    renderResults(<SuggestButton actions={actions} label="Suggest all" />)
    await userEvent.click(screen.getByRole("button", { name: "Suggest all" }))
    expect(actions.suggest).toHaveBeenCalledWith(undefined)
  })

  it("is disabled with a hint while no key or text model is ready", () => {
    renderResults(<SuggestButton actions={mockActions({ canUseAi: false })} label="Suggest" />)
    expect(screen.getByRole("button", { name: "Suggest" })).toBeDisabled()
    expect(screen.getByText(aiScoreCopy("en").results.needsAi)).toBeInTheDocument()
  })

  it("is disabled during a run and says so, instead of asking for a key", () => {
    const copy = aiScoreCopy("en").results
    renderResults(<SuggestButton actions={mockActions({ canUseAi: false, running: true })} label="Suggest" />)
    expect(screen.getByRole("button", { name: "Suggest" })).toBeDisabled()
    expect(screen.getByText(copy.runInProgress)).toBeInTheDocument()
    expect(screen.queryByText(copy.needsAi)).not.toBeInTheDocument()
  })

  it("shows that suggestions are being written, and waits for a running report", () => {
    const { unmount } = renderResults(<SuggestButton actions={mockActions({ busy: "suggestions" })} label="Suggest" />)
    const button = screen.getByRole("button", { name: aiScoreCopy("en").results.suggestions.writing })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute("aria-busy", "true")
    unmount()
    renderResults(<SuggestButton actions={mockActions({ busy: "report" })} label="Suggest" />)
    expect(screen.getByRole("button", { name: "Suggest" })).toBeDisabled()
  })
})

import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { FullscreenButton } from "./fullscreen-button"

const labels = { enterLabel: "Full screen", exitLabel: "Leave full screen" }

function setFullscreen(enabled: boolean, element: Element | null = null) {
  Object.defineProperty(document, "fullscreenEnabled", { configurable: true, value: enabled })
  Object.defineProperty(document, "fullscreenElement", { configurable: true, value: element })
}

afterEach(() => setFullscreen(false))

describe("FullscreenButton", () => {
  it("renders nothing where full screen is not available", () => {
    setFullscreen(false)
    const { container } = render(<FullscreenButton {...labels} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("asks for full screen, then offers to leave it", async () => {
    setFullscreen(true)
    const request = vi.fn(() => Promise.resolve())
    document.documentElement.requestFullscreen = request
    render(<FullscreenButton {...labels} />)
    await userEvent.click(screen.getByRole("button", { name: "Full screen" }))
    expect(request).toHaveBeenCalled()

    setFullscreen(true, document.documentElement)
    act(() => {
      document.dispatchEvent(new Event("fullscreenchange"))
    })
    expect(screen.getByRole("button", { name: "Leave full screen" })).toHaveAttribute("aria-pressed", "true")
  })
})

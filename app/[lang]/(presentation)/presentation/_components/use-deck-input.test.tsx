import { fireEvent, render, renderHook, screen } from "@testing-library/react"
import type { PointerEvent } from "react"
import { describe, expect, it, vi } from "vitest"
import { useDeckKeys, useSwipe } from "./use-deck-input"

function Keys({ onAction }: { onAction: (action: string) => void }) {
  useDeckKeys(onAction)
  return (
    <>
      <input aria-label="Field" />
      <button type="button">Button</button>
    </>
  )
}

const pointer = (type: string, x: number, y = 0, id = 1) => ({ pointerType: type, pointerId: id, clientX: x, clientY: y }) as unknown as PointerEvent

describe("useDeckKeys", () => {
  it("turns deck keys into actions and leaves the rest alone", () => {
    const onAction = vi.fn()
    render(<Keys onAction={onAction} />)
    fireEvent.keyDown(window, { key: "ArrowRight" })
    fireEvent.keyDown(window, { key: "PageUp" })
    fireEvent.keyDown(window, { key: "a" })
    fireEvent.keyDown(window, { key: "ArrowRight", ctrlKey: true })
    expect(onAction.mock.calls.map(([action]) => action)).toEqual(["next", "previous"])
  })

  it("leaves arrow keys to a focused text field", () => {
    const onAction = vi.fn()
    render(<Keys onAction={onAction} />)
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Field" }), { key: "ArrowRight" })
    expect(onAction).not.toHaveBeenCalled()
    fireEvent.keyDown(screen.getByRole("button", { name: "Button" }), { key: "ArrowRight" })
    expect(onAction).toHaveBeenCalledWith("next")
  })
})

describe("useSwipe", () => {
  it("turns a horizontal touch swipe into a step and ignores the mouse", () => {
    const onAction = vi.fn()
    const { result } = renderHook(() => useSwipe(onAction))
    result.current.onPointerDown(pointer("touch", 300))
    result.current.onPointerUp(pointer("touch", 100))
    expect(onAction).toHaveBeenLastCalledWith("next")
    result.current.onPointerDown(pointer("mouse", 300))
    result.current.onPointerUp(pointer("mouse", 100))
    expect(onAction).toHaveBeenCalledTimes(1)
    result.current.onPointerDown(pointer("touch", 100))
    result.current.onPointerCancel()
    result.current.onPointerUp(pointer("touch", 300))
    expect(onAction).toHaveBeenCalledTimes(1)
  })
})

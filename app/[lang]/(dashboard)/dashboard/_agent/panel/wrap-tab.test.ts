import { afterEach, describe, expect, it, vi } from "vitest"
import { tabbables, wrapTab } from "./wrap-tab"

function panel() {
  document.body.innerHTML = `
    <button id="outside">Outside</button>
    <section id="panel" tabindex="-1">
      <button id="first">Close</button>
      <input type="radio" name="p" id="a" checked><input type="radio" name="p" id="b">
      <button id="off" disabled>Off</button>
      <div hidden><button id="hidden">Hidden</button></div>
      <span tabindex="-1" id="skip">Not a tab stop</span>
      <textarea id="last"></textarea>
    </section>`
  return document.getElementById("panel")!
}

const tab = (shiftKey = false) => ({ key: "Tab", shiftKey, defaultPrevented: false, preventDefault: vi.fn() })
const byId = (id: string) => document.getElementById(id)!

afterEach(() => {
  document.body.innerHTML = ""
})

describe("wrapTab (the panel while modal)", () => {
  it("knows the tab stops: no disabled, hidden, negative-tabindex or unchecked radio elements", () => {
    expect(tabbables(panel()).map((element) => element.id)).toEqual(["first", "a", "last"])
  })

  it("goes from the last element to the first, and back with Shift+Tab", () => {
    const container = panel()
    byId("last").focus()
    const forward = tab()
    wrapTab(forward, container)
    expect(forward.preventDefault).toHaveBeenCalled()
    expect(byId("first")).toHaveFocus()
    const back = tab(true)
    wrapTab(back, container)
    expect(back.preventDefault).toHaveBeenCalled()
    expect(byId("last")).toHaveFocus()
  })

  it("takes Shift+Tab from the panel itself to its last element", () => {
    const container = panel()
    container.focus()
    wrapTab(tab(true), container)
    expect(byId("last")).toHaveFocus()
  })

  it("brings focus back from outside, and leaves Tab alone in the middle", () => {
    const container = panel()
    byId("outside").focus()
    wrapTab(tab(), container)
    expect(byId("first")).toHaveFocus()
    const middle = tab()
    wrapTab(middle, container)
    expect(middle.preventDefault).not.toHaveBeenCalled()
    const other = { ...tab(), key: "Enter" }
    byId("last").focus()
    wrapTab(other, container)
    expect(other.preventDefault).not.toHaveBeenCalled()
  })
})

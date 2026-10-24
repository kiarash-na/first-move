import { describe, expect, it } from "vitest"
import { revealActiveLink } from "./reveal-active-link"

function setup(itemTop: number, itemBottom: number, scrollTop = 0) {
  const scroller = document.createElement("div")
  scroller.innerHTML = `<a href="/a">A</a><a href="/b" aria-current="page">B</a>`
  scroller.scrollTop = scrollTop
  scroller.getBoundingClientRect = () => ({ top: 100, bottom: 500 }) as DOMRect
  scroller.querySelector<HTMLElement>("[aria-current]")!.getBoundingClientRect = () => ({ top: itemTop, bottom: itemBottom }) as DOMRect
  return scroller
}

describe("revealActiveLink (D-07)", () => {
  it("scrolls a link below the visible area into view", () => {
    const scroller = setup(828, 872)
    revealActiveLink(scroller)
    expect(scroller.scrollTop).toBe(872 - 500 + 24)
  })

  it("scrolls a link above the visible area into view", () => {
    const scroller = setup(40, 84, 300)
    revealActiveLink(scroller)
    expect(scroller.scrollTop).toBe(300 - 60 - 24)
  })

  it("leaves a visible link and a list without a current page alone", () => {
    const scroller = setup(200, 244, 10)
    revealActiveLink(scroller)
    expect(scroller.scrollTop).toBe(10)
    const empty = document.createElement("div")
    revealActiveLink(empty)
    expect(empty.scrollTop).toBe(0)
  })
})

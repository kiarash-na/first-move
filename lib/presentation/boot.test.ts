import { afterEach, describe, expect, it } from "vitest"
import { DECK_BOOT_SCRIPT, DECK_BOOT_STYLE_ID } from "./boot"

const run = () => new Function(DECK_BOOT_SCRIPT)()

afterEach(() => {
  document.getElementById(DECK_BOOT_STYLE_ID)?.remove()
  document.documentElement.removeAttribute("data-deck")
  window.location.hash = ""
})

describe("deck boot script", () => {
  it("marks the page as a deck", () => {
    run()
    expect(document.documentElement.dataset.deck).toBe("js")
    expect(document.getElementById(DECK_BOOT_STYLE_ID)).toBeNull()
  })

  it("shows the deep-linked slide before hydration", () => {
    window.location.hash = "#5"
    run()
    const style = document.getElementById(DECK_BOOT_STYLE_ID)
    expect(style?.textContent).toContain('.deck-slide[data-number="5"]')
  })

  it("ignores hashes outside the deck", () => {
    for (const hash of ["#0", "#11", "#x"]) {
      window.location.hash = hash
      run()
      expect(document.getElementById(DECK_BOOT_STYLE_ID)).toBeNull()
    }
  })
})

import { describe, expect, it } from "vitest"
import {
  actionForKey,
  applyAction,
  clampSlide,
  hashForSlide,
  keyBelongsToTarget,
  padSlideNumber,
  SLIDE_COUNT,
  SLIDE_IDS,
  slideFromHash,
  swipeAction,
} from "./slides"

describe("presentation slides", () => {
  it("has ten slides, no more", () => {
    expect(SLIDE_COUNT).toBe(10)
    expect(new Set(SLIDE_IDS).size).toBe(10)
    expect(SLIDE_IDS[0]).toBe("why")
    expect(SLIDE_IDS.at(-1)).toBe("contact")
  })

  it("reads a 1-based slide number from the hash and ignores anything else", () => {
    expect(slideFromHash("#3")).toBe(2)
    expect(slideFromHash("10")).toBe(9)
    expect(slideFromHash("#1")).toBe(0)
    for (const hash of ["", "#", "#0", "#11", "#abc", "#2.5", "#-1"]) expect(slideFromHash(hash)).toBeNull()
    expect(hashForSlide(2)).toBe("#3")
    expect(padSlideNumber(3)).toBe("03")
  })

  it("clamps indexes", () => {
    expect(clampSlide(-4)).toBe(0)
    expect(clampSlide(42)).toBe(9)
    expect(clampSlide(Number.NaN)).toBe(0)
    expect(clampSlide(3.7)).toBe(3)
  })

  it("maps keys to actions, Shift+Space going back", () => {
    expect(actionForKey("ArrowRight")).toBe("next")
    expect(actionForKey("PageDown")).toBe("next")
    expect(actionForKey(" ")).toBe("next")
    expect(actionForKey(" ", true)).toBe("previous")
    expect(actionForKey("ArrowUp")).toBe("previous")
    expect(actionForKey("Home")).toBe("first")
    expect(actionForKey("End")).toBe("last")
    expect(actionForKey("a")).toBeNull()
  })

  it("stops at both ends", () => {
    expect(applyAction(0, "previous")).toBe(0)
    expect(applyAction(9, "next")).toBe(9)
    expect(applyAction(4, "next")).toBe(5)
    expect(applyAction(4, "first")).toBe(0)
    expect(applyAction(4, "last")).toBe(9)
  })

  it("leaves keys to text fields, to buttons for Space and Enter, and to arrow widgets", () => {
    expect(keyBelongsToTarget("ArrowRight", { tagName: "INPUT" })).toBe(true)
    expect(keyBelongsToTarget(" ", { tagName: "BUTTON" })).toBe(true)
    expect(keyBelongsToTarget("Enter", { tagName: "A" })).toBe(true)
    expect(keyBelongsToTarget("ArrowRight", { tagName: "BUTTON" })).toBe(false)
    expect(keyBelongsToTarget("ArrowRight", { tagName: "BUTTON", role: "radio", ancestorRoles: ["radiogroup"] })).toBe(true)
    expect(keyBelongsToTarget("PageDown", { tagName: "BUTTON", ancestorRoles: ["radiogroup"] })).toBe(false)
    expect(keyBelongsToTarget(" ", { tagName: "BODY" })).toBe(false)
    expect(keyBelongsToTarget("ArrowLeft", null)).toBe(false)
  })

  it("reads a clear horizontal swipe only", () => {
    expect(swipeAction(-120, 10)).toBe("next")
    expect(swipeAction(120, -20)).toBe("previous")
    expect(swipeAction(-30, 0)).toBeNull()
    expect(swipeAction(-80, 90)).toBeNull()
  })
})

import { describe, expect, it } from "vitest"
import { interpolate } from "./interpolate"

describe("interpolate", () => {
  it("fills every placeholder", () => {
    expect(interpolate("Saved {time} by {who}", { time: "14:05", who: "you" })).toBe("Saved 14:05 by you")
  })

  it("formats numbers as given and repeats placeholders", () => {
    expect(interpolate("{n} of {n}", { n: 3 })).toBe("3 of 3")
  })

  it("keeps unknown placeholders visible", () => {
    expect(interpolate("Saved {time}", {})).toBe("Saved {time}")
  })

  it("never reads inherited keys", () => {
    expect(interpolate("{toString}", {})).toBe("{toString}")
  })
})

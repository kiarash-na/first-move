import { describe, expect, it } from "vitest"
import { TRUNCATED_MARKER, truncateText } from "./truncate"

describe("truncateText", () => {
  it("keeps text within the limit", () => {
    expect(truncateText("short", 10)).toEqual({ text: "short", truncated: false })
    expect(truncateText("x".repeat(10), 10)).toEqual({ text: "x".repeat(10), truncated: false })
  })

  it("cuts at a paragraph boundary near the limit and adds the marker", () => {
    const text = `${"a".repeat(80)}\n\n${"b".repeat(80)}`
    const result = truncateText(text, 100)
    expect(result).toEqual({ text: `${"a".repeat(80)}\n${TRUNCATED_MARKER}`, truncated: true })
  })

  it("cuts after a sentence, else at a word", () => {
    expect(truncateText(`${"word ".repeat(15)}End. ${"more ".repeat(10)}`, 100).text).toBe(`${"word ".repeat(15)}End.\n${TRUNCATED_MARKER}`)
    expect(truncateText("word ".repeat(40), 60).text).toBe(`${"word ".repeat(9).trimEnd()}\n${TRUNCATED_MARKER}`)
  })

  it("never returns more than the limit", () => {
    for (const max of [12, 13, 50, 99, 1000]) {
      const result = truncateText("lorem ipsum dolor sit amet. ".repeat(100), max)
      expect(result.text.length).toBeLessThanOrEqual(max)
      expect(result.text.endsWith(TRUNCATED_MARKER)).toBe(true)
    }
  })

  it("hard-cuts text without boundaries, never inside a surrogate pair", () => {
    const result = truncateText("😀".repeat(50), 30)
    expect(result.text.length).toBeLessThanOrEqual(30)
    expect(result.text).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/)
  })

  it("adds the marker to text the caller already cut, also when it now fits", () => {
    expect(truncateText("short", 100, { alreadyCut: true })).toEqual({ text: `short\n${TRUNCATED_MARKER}`, truncated: true })
    expect(truncateText("word ".repeat(40), 60, { alreadyCut: true }).text.length).toBeLessThanOrEqual(60)
  })

  it("returns only the marker when the limit leaves no room for text", () => {
    expect(truncateText("abcdefghijklmnop", 5)).toEqual({ text: TRUNCATED_MARKER.slice(0, 5), truncated: true })
  })
})

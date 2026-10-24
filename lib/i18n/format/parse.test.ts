import { describe, expect, it } from "vitest"
import { parseNumber } from "./parse"

describe("parseNumber", () => {
  it("parses plain integers and decimals in both notations (D-21)", () => {
    expect(parseNumber("42", "en")).toBe(42)
    expect(parseNumber("1.5", "en")).toBe(1.5)
    expect(parseNumber("1,5", "de")).toBe(1.5)
  })

  it("accepts the other language's decimal separator", () => {
    expect(parseNumber("1,5", "en")).toBe(1.5)
    expect(parseNumber("1.5", "de")).toBe(1.5)
    expect(parseNumber("0,500", "en")).toBe(0.5)
  })

  it("reads a single separator plus three digits by the UI language", () => {
    expect(parseNumber("1.234", "de")).toBe(1234)
    expect(parseNumber("1.234", "en")).toBe(1.234)
    expect(parseNumber("1,234", "en")).toBe(1234)
    expect(parseNumber("1,234", "de")).toBe(1.234)
  })

  it("parses mixed grouping and decimal separators", () => {
    expect(parseNumber("1.234.567,89", "de")).toBe(1234567.89)
    expect(parseNumber("1,234,567.89", "en")).toBe(1234567.89)
    expect(parseNumber("1.234,5", "en")).toBe(1234.5)
    expect(parseNumber("1.234.567", "en")).toBe(1234567)
  })

  it("ignores spaces and handles signs", () => {
    expect(parseNumber(" 1 234,5 ", "de")).toBe(1234.5)
    expect(parseNumber("1 234", "de")).toBe(1234)
    expect(parseNumber("-2,5", "de")).toBe(-2.5)
    expect(parseNumber("−2.5", "en")).toBe(-2.5)
    expect(parseNumber("+3", "en")).toBe(3)
    expect(parseNumber(".5", "en")).toBe(0.5)
    expect(parseNumber("5.", "en")).toBe(5)
  })

  it("rejects anything that is not a plain number", () => {
    for (const input of ["", " ", ".", "-", "abc", "1e5", "12%", "1.2.3", "1,23,4", "1.234,5,6", "1..2"]) {
      expect(parseNumber(input, "en")).toBeNull()
      expect(parseNumber(input, "de")).toBeNull()
    }
  })
})

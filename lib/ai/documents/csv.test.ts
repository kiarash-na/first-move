import { describe, expect, it } from "vitest"
import { detectDelimiter, parseCsv } from "./csv"

describe("parseCsv (RFC 4180)", () => {
  it("splits rows and fields", () => {
    expect(parseCsv("a,b,c\n1,2,3\n", ",")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ])
  })

  it("handles quotes, doubled quotes, delimiters and line breaks inside quotes, and CRLF", () => {
    expect(parseCsv('name;note\r\n"Smith; J.";"said ""yes""\r\nthen left"\r\n', ";")).toEqual([
      ["name", "note"],
      ["Smith; J.", 'said "yes"\r\nthen left'],
    ])
  })

  it("keeps empty fields and a last row without line break", () => {
    expect(parseCsv("a,,c\n,,", ",")).toEqual([
      ["a", "", "c"],
      ["", "", ""],
    ])
  })
})

describe("detectDelimiter", () => {
  it("finds the delimiter of consistent rows", () => {
    expect(detectDelimiter("Gebäude;Fläche\nWohnen;1,5\nBüro;2,5")).toBe(";")
    expect(detectDelimiter("type,count\nresidential,120\noffice,3")).toBe(",")
    expect(detectDelimiter("a\tb\n1\t2")).toBe("\t")
  })

  it("prefers the semicolon when commas are decimal separators", () => {
    expect(detectDelimiter("1,5;2,5\n3,25;4,75\n5;6")).toBe(";")
  })

  it("does not take prose for CSV", () => {
    expect(detectDelimiter("Hello, we have 120 buildings.\nThe area is about 12 ha, maybe more, maybe less.\nThanks")).toBeNull()
    expect(detectDelimiter("one line, only")).toBeNull()
  })
})

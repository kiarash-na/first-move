import { describe, expect, it } from "vitest"
import { blockShape, parseBlocks } from "./parse-blocks"

describe("parseBlocks", () => {
  it("makes a paragraph of plain text and skips blank lines", () => {
    expect(parseBlocks(["First.", "", "  Second.  "])).toEqual([
      { type: "p", text: "First." },
      { type: "p", text: "Second." },
    ])
  })

  it("groups consecutive bullets and consecutive numbered items", () => {
    expect(parseBlocks(["- a", "- b", "1. one", "2. two", "- c"])).toEqual([
      { type: "ul", items: ["a", "b"] },
      { type: "ol", items: ["one", "two"] },
      { type: "ul", items: ["c"] },
    ])
  })

  it("makes one note per quote line", () => {
    expect(parseBlocks(["> a", "> b"])).toEqual([
      { type: "note", text: "a" },
      { type: "note", text: "b" },
    ])
  })

  it("reads a table: first row is the header, a separator row is ignored", () => {
    expect(parseBlocks(["| Name | Use |", "|---|---|", "| `a` | b |", "| c | d |"])).toEqual([
      { type: "table", head: ["Name", "Use"], rows: [["`a`", "b"], ["c", "d"]] },
    ])
  })

  it("starts a new table after another block", () => {
    const blocks = parseBlocks(["| A |", "| 1 |", "text", "| B |", "| 2 |"])
    expect(blocks.map((block) => block.type)).toEqual(["table", "p", "table"])
  })

  it("does not read a dash inside text as a bullet", () => {
    expect(parseBlocks(["a - b", "-5 degrees"])).toEqual([
      { type: "p", text: "a - b" },
      { type: "p", text: "-5 degrees" },
    ])
  })
})

describe("blockShape", () => {
  it("describes the structure without the text", () => {
    expect(blockShape(["Intro", "- a", "- b", "| H1 | H2 |", "| 1 | 2 |", "> n"])).toEqual([
      "p",
      "ul:2",
      "table:2x1",
      "note",
    ])
  })
})

// @vitest-environment node
import { describe, expect, it } from "vitest"
import type { Block } from "../model"
import { renderHtml } from "../render/html"
import { renderText } from "../render/text"
import { MessageBlock } from "./message-block"

const blocks: Block[] = [
  { type: "text", text: "Hello" },
  { type: "bullets", items: ["a"] },
  { type: "questions", items: [{ number: 1, text: "Q?", hints: [] }] },
  { type: "options", items: [{ number: 1, label: "Quick Check", description: "d" }] },
  { type: "rows", rows: [{ label: "L", value: "V" }] },
  { type: "verdict", level: "further_analysis", label: "Further analysis required", description: "Mixed" },
  { type: "indicators", items: [{ label: "I", value: "1", classLabel: "C", effect: null }] },
  { type: "button", label: "Open", href: "https://firstmove.energy/en" },
  { type: "notes", items: [{ title: "T", text: "S", formulas: ["EQ-3.3 Building density"] }] },
]

describe("MessageBlock", () => {
  it.each(blocks)("renders a $type block", (block) => {
    expect(renderHtml(<MessageBlock block={block} accent="cool" />)).not.toBe("")
    expect(renderText(<MessageBlock block={block} accent="cool" />)).not.toBe("")
  })
})

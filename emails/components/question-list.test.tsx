// @vitest-environment node
import { describe, expect, it } from "vitest"
import { renderHtml } from "../render/html"
import { renderText } from "../render/text"
import { COLORS } from "../theme"
import { QuestionList } from "./question-list"

const items = [
  { number: 1, text: "What is the project called?", optional: "optional", hints: ["Example: Sonnenhof estate"] },
  { number: 2, text: "How many buildings are in the project area?", hints: ["Example: 42"] },
]

describe("QuestionList", () => {
  it("numbers the questions in the accent and keeps the hints with them", () => {
    const node = <QuestionList items={items} accent="cool" />
    expect(renderHtml(node)).toContain(COLORS.cool)
    expect(renderText(node)).toBe(
      "1.  What is the project called? (optional)\nExample: Sonnenhof estate\n\n2.  How many buildings are in the project area?\nExample: 42",
    )
  })
})

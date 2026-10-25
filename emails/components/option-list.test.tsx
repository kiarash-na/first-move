// @vitest-environment node
import { describe, expect, it } from "vitest"
import { renderHtml } from "../render/html"
import { renderText } from "../render/text"
import { OptionList } from "./option-list"

describe("OptionList", () => {
  it("shows each choice with its number, name and description", () => {
    const node = (
      <OptionList
        items={[
          { number: 1, label: "Quick Check", description: "A first screening." },
          { number: 2, label: "Business Plan", description: "Four steps." },
        ]}
      />
    )
    expect(renderHtml(node)).not.toMatch(/radius/)
    expect(renderText(node)).toBe("1  Quick Check\nA first screening.\n2  Business Plan\nFour steps.")
  })
})

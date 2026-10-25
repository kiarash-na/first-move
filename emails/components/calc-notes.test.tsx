// @vitest-environment node
import { describe, expect, it } from "vitest"
import { renderText } from "../render/text"
import { CalcNotes } from "./calc-notes"

describe("CalcNotes", () => {
  it("lists each result's sentence with its equation ids", () => {
    const node = (
      <CalcNotes
        items={[
          { title: "Heating coverage", text: "The heating supply divided by the heating demand.", formulas: ["EQ-3.8a Heating supply per source", "EQ-3.6a Heating supply coverage"] },
        ]}
      />
    )
    expect(renderText(node)).toBe(
      "Heating coverage\n\nThe heating supply divided by the heating demand.\n\nEQ-3.8a Heating supply per source · EQ-3.6a Heating supply coverage",
    )
  })
})

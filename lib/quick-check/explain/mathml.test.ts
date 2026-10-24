// @vitest-environment node
import { describe, expect, it } from "vitest"
import { FORMULA_IDS, FORMULAS } from "./formulas"
import { FORMULA_MATHML } from "./mathml"

describe("formula MathML (D-33)", () => {
  it("covers exactly the formula ids", () => {
    expect(Object.keys(FORMULA_MATHML)).toEqual(FORMULA_IDS)
  })

  it("has MathML for every formula with LaTeX, and none for EQ-3.7", () => {
    for (const id of FORMULA_IDS) {
      const { mathml, outputMathml } = FORMULA_MATHML[id]
      if (FORMULAS[id].latex === null) {
        expect(mathml, id).toBeNull()
      } else {
        expect(mathml, id).toContain('<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">')
        expect(mathml, id).not.toContain("katex-html")
        expect(outputMathml, id).toContain('<math xmlns="http://www.w3.org/1998/Math/MathML">')
      }
    }
    expect(FORMULA_MATHML["EQ-3.7"].mathml).toBeNull()
  })

  it("keeps the source LaTeX in the MathML annotation", () => {
    expect(FORMULA_MATHML["EQ-3.12"].mathml).toContain('<annotation encoding="application/x-tex">C_{O\\&amp;M} = 0.02')
  })
})

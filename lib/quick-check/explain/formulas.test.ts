// @vitest-environment node
import { describe, expect, it } from "vitest"
import { EQUATION_IDS } from "@/lib/project/catalog/references"
import { FORMULA_IDS, FORMULAS, formulaNameKey } from "./formulas"

describe("formulas (D-33)", () => {
  it("lists every equation in methodology order, then the resolved OQ formulas", () => {
    expect(FORMULA_IDS).toEqual([...EQUATION_IDS, "OQ-12", "OQ-21"])
  })

  it("has MathML for every formula with LaTeX, and none for EQ-3.7", () => {
    for (const id of FORMULA_IDS) {
      const formula = FORMULAS[id]
      expect(formula.id).toBe(id)
      if (formula.latex === null) {
        expect(formula.mathml, id).toBeNull()
      } else {
        expect(formula.mathml, id).toContain('<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">')
        expect(formula.mathml, id).not.toContain("katex-html")
        expect(formula.outputMathml, id).toContain('<math xmlns="http://www.w3.org/1998/Math/MathML">')
      }
    }
    expect(FORMULAS["EQ-3.7"].latex).toBeNull()
  })

  it("keeps the source LaTeX in the MathML annotation", () => {
    expect(FORMULAS["EQ-3.12"].latex).toBe("C_{O\\&M} = 0.02 \\cdot C_{overall}")
    expect(FORMULAS["EQ-3.12"].mathml).toContain('<annotation encoding="application/x-tex">C_{O\\&amp;M} = 0.02')
  })

  it("names the calc dictionary key of each formula", () => {
    expect(formulaNameKey("EQ-3.4a")).toBe("formulas.eq-03-04a")
    expect(formulaNameKey("OQ-21")).toBe("formulas.oq-21")
  })

  it("comes from the docs files", () => {
    expect(FORMULAS["EQ-3.10d"].file).toBe("docs/10_quick-check-tool/02_run-quick-check/eq-03-10d_overall-investment.md")
    expect(FORMULAS["OQ-12"].file).toBe("docs/10_quick-check-tool/open-questions/OQ-12_ch-ratio-formula.md")
  })
})

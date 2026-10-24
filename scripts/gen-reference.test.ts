// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { parse } from "yaml"
import {
  frontmatterOf,
  generateReference,
  outdatedFiles,
  REFERENCE_OUT,
  staleFiles,
  toMathml,
} from "./gen-reference.mjs"

const root = path.resolve(__dirname, "..")
const files = generateReference(root)

describe("gen:reference", () => {
  it("has written every generated file as the generator produces it (run `pnpm gen:reference`)", () => {
    expect(outdatedFiles(root, files)).toEqual([])
    expect(staleFiles(root, files)).toEqual([])
  })

  it("produces one file per reference YAML plus the equation file", () => {
    const yamls = readdirSync(path.join(root, "docs/10_quick-check-tool/_reference")).filter((file) =>
      file.endsWith(".yaml"),
    )
    const references = files.filter((file) => file.path.startsWith(`${REFERENCE_OUT}/`))
    expect(references).toHaveLength(yamls.length)
    expect(files.map((file) => file.path)).toContain("lib/quick-check/explain/equations.gen.ts")
  })

  it("keeps the YAML data exactly (TBL-6 as an example)", async () => {
    const yaml = parse(
      readFileSync(path.join(root, "docs/10_quick-check-tool/_reference/table-06_economic-parameters.yaml"), "utf8"),
    )
    const { TBL_6 } = await import("@/lib/quick-check/reference/table-06-economic-parameters.gen")
    expect(TBL_6).toEqual(yaml)
  })

  it("renders LaTeX to MathML only (no HTML layout spans), inline or as a block", () => {
    const inline = toMathml("a = b")
    expect(inline).toContain("<math")
    expect(inline).not.toContain("katex-html")
    expect(inline).not.toContain('display="block"')
    expect(toMathml("a = b", { display: true })).toContain('<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">')
  })

  it("reads the frontmatter of a markdown file", () => {
    expect(frontmatterOf("---\nid: X\nlatex: a = b\n---\n# X\n", "x.md")).toEqual({ id: "X", latex: "a = b" })
    expect(() => frontmatterOf("# no frontmatter", "x.md")).toThrow("x.md")
  })
})

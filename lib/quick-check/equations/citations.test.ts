// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { EQUATION_IDS } from "@/lib/project/catalog/references"
import { EQUATIONS } from "@/lib/quick-check/explain/equations.gen"

const files = readdirSync(__dirname)
  .filter((file) => file.startsWith("eq-") && !file.endsWith(".test.ts"))
  .sort()

/** `eq-03-04a` (docs file prefix) → `eq-3-04a` (equation file prefix). */
const prefixOf = (slug: string) => `${slug.replace(/^eq-0?/, "eq-")}-`

describe("equation files", () => {
  it("exist once per equation of methodology §3", () => {
    const prefixes = EQUATION_IDS.map((id) => prefixOf(EQUATIONS[id].slug))
    expect(files.map((file) => prefixes.find((prefix) => file.startsWith(prefix)))).toEqual(prefixes)
  })

  it.each(EQUATION_IDS)("%s cites its ID and the exact latex: of its docs file", (id) => {
    const file = files.find((name) => name.startsWith(prefixOf(EQUATIONS[id].slug)))!
    const firstLine = readFileSync(path.join(__dirname, file), "utf8").split("\n")[0]
    const { latex } = EQUATIONS[id]
    expect(firstLine).toBe(latex === null ? `// ${id}: no equation in the source (latex: null); the formula is the OQ-12 answer` : `// ${id}: ${latex}`)
  })
})

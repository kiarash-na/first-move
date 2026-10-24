// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { EQUATION_IDS, TABLE_IDS } from "./references"

const qct = path.resolve(__dirname, "../../../docs/10_quick-check-tool")

/** The `id:` line of a file's frontmatter (md) or top level (yaml). */
function idOf(file: string): string | undefined {
  return readFileSync(file, "utf8").match(/^id: (.+)$/m)?.[1].trim()
}

describe("reference ids", () => {
  it("list every equation file in 02_run-quick-check, in order", () => {
    const dir = path.join(qct, "02_run-quick-check")
    const files = readdirSync(dir).filter((file) => file.startsWith("eq-")).sort()
    expect(files.map((file) => idOf(path.join(dir, file)))).toEqual([...EQUATION_IDS])
  })

  it("list every reference table, in order", () => {
    const dir = path.join(qct, "_reference")
    const files = readdirSync(dir).filter((file) => file.startsWith("table-")).sort()
    expect(files.map((file) => idOf(path.join(dir, file)))).toEqual([...TABLE_IDS])
  })
})

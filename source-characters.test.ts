// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

/**
 * No hidden characters in the sources ("Trojan Source", CVE-2021-42574): bidi controls that
 * reorder code, zero-width and other invisible format characters, Unicode tags, variation
 * selectors, private-use and control characters. Write such a character as an escape
 * (`\u{200B}`) instead. Allowed: no-break spaces (number formats) and the invisible MathML
 * operators U+2061–2064 (generated equations).
 */
const ROOT = __dirname
const SKIP = new Set(["node_modules", ".next", ".claude", ".git", ".swc", "coverage", "test-results", "playwright-report", "00_originals"])
const SOURCE = /\.(ts|tsx|js|mjs|cjs|json|md|mdx|css|yaml|yml)$/
const HIDDEN =
  /(?![\u{2061}-\u{2064}])\p{Cf}|\p{Co}|[\u{FE00}-\u{FE0F}\u{E0100}-\u{E01EF}\u{34F}\u{115F}\u{1160}\u{3164}\u{FFA0}\u{2028}\u{2029}]|(?![\n\r\t])\p{Cc}/gu

function files(dir: string): string[] {
  return readdirSync(path.join(ROOT, dir)).flatMap((name) => {
    if (SKIP.has(name)) return []
    const relative = dir ? `${dir}/${name}` : name
    if (statSync(path.join(ROOT, relative)).isDirectory()) return files(relative)
    return SOURCE.test(name) ? [relative] : []
  })
}

const codePoint = (char: string) => `U+${char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`

describe("source characters", () => {
  it("finds the files it checks", () => {
    expect(files("").length).toBeGreaterThan(500)
  })

  it("contain no hidden characters", () => {
    const found = files("").flatMap((file) => {
      const hits = [...new Set(readFileSync(path.join(ROOT, file), "utf8").match(HIDDEN) ?? [])]
      return hits.length ? [`${file}: ${hits.map(codePoint).join(" ")}`] : []
    })
    expect(found).toEqual([])
  })

  it("catches what it is meant to catch", () => {
    for (const code of [0x202e, 0x2066, 0x200b, 0xfeff, 0xe0041, 0xfe0f, 0xe000, 0x0007]) {
      expect(`a${String.fromCodePoint(code)}b`.match(HIDDEN), codePoint(String.fromCodePoint(code))).not.toBeNull()
    }
    for (const code of [0x00a0, 0x202f, 0x2061, 0x0a, 0x09]) expect(`a${String.fromCodePoint(code)}b`.match(HIDDEN)).toBeNull()
  })
})

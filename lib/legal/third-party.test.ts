// @vitest-environment node
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { THIRD_PARTY } from "./third-party"

const root = process.cwd()
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as {
  dependencies: Record<string, string>
}

describe("third-party licence table", () => {
  it("lists every runtime dependency in package.json", () => {
    const listed = THIRD_PARTY.map((entry) => entry.name).sort()
    expect(listed).toEqual(Object.keys(pkg.dependencies).sort())
  })

  it("lists each package once", () => {
    const names = THIRD_PARTY.map((entry) => entry.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it("matches the licence declared by the installed package", () => {
    for (const entry of THIRD_PARTY) {
      const file = path.join(root, "node_modules", entry.name, "package.json")
      if (!existsSync(file)) continue
      const installed = JSON.parse(readFileSync(file, "utf8")) as { license?: string }
      expect(installed.license, entry.name).toBe(entry.license)
    }
  })

  it("links every entry over https", () => {
    for (const entry of THIRD_PARTY) expect(entry.url.startsWith("https://"), entry.name).toBe(true)
  })
})

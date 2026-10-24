// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * D-14: imported (and all user) text is never rendered as HTML. React escapes text, so the only
 * risk is raw HTML injection. These files inject build-time strings that never contain user data:
 * the theme pre-paint script and the chart colour CSS. Add a file here only for such strings.
 */
const ALLOWED = new Set(["components/theme/theme-script.tsx", "components/ui/chart.tsx"])
const ROOTS = ["app", "components", "lib"]
const RAW_HTML = /dangerouslySetInnerHTML|\.innerHTML\s*=|\.outerHTML\s*=|insertAdjacentHTML|document\.write\(/

const root = process.cwd()

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : []
  })
}

describe("no raw HTML rendering (D-14)", () => {
  it("only allow-listed files inject HTML", () => {
    const offenders = ROOTS.flatMap((dir) => sourceFiles(join(root, dir)))
      .map((path) => relative(root, path))
      .filter((path) => !ALLOWED.has(path) && RAW_HTML.test(readFileSync(join(root, path), "utf8")))
    expect(offenders).toEqual([])
  })
})

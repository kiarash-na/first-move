// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/** D-14: project data never leaves the browser. Storage and store code make no requests at all. */
const NETWORK = /\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|navigator\.share/

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : []
  })
}

describe("no network in storage (D-14)", () => {
  it("lib/storage and lib/store never call the network", () => {
    const root = process.cwd()
    const files = ["lib/storage", "lib/store"].flatMap((dir) => sourceFiles(join(root, dir)))
    expect(files.length).toBeGreaterThan(10)
    expect(files.filter((path) => NETWORK.test(readFileSync(path, "utf8")))).toEqual([])
  })
})

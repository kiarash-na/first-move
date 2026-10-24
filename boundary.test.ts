// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

/**
 * The AI layer's code boundary (PLAN-AGENT-00 § Folders), checked on resolved paths so relative
 * imports cannot slip past the ESLint rule. Paths are repo-relative with forward slashes.
 */
const ROOT = __dirname
const SKIP = new Set(["node_modules", ".next", ".claude", ".git", ".swc", "coverage", "test-results", "playwright-report"])
const SOURCE = /\.(ts|tsx|mts|js|mjs)$/

const AGENT_UI = /^app\/\[lang\]\/\(dashboard\)\/dashboard\/(_agent|connect)\//
const AGENT_ROUTES = /^app\/(api\/|\[lang\]\/\(docs\)\/mail\/|\.well-known\/)/
const CORE_LIB = /^lib\/(project|quick-check|business-plan|storage|store|i18n|dashboard|legal|examples|theme)\/|^lib\/utils\.ts$/
const AI_LAYER = /^(lib\/(ai|assistant|mail-agent)|workflows|emails)(\/|\.|$)/

/** Imports the boundary allows on purpose (the touch points of PLAN-AGENT-00). */
const ALLOWED: readonly [from: RegExp, to: RegExp][] = []

function files(dir: string): string[] {
  return readdirSync(path.join(ROOT, dir)).flatMap((name) => {
    if (SKIP.has(name)) return []
    const relative = dir ? `${dir}/${name}` : name
    if (statSync(path.join(ROOT, relative)).isDirectory()) return files(relative)
    return SOURCE.test(name) ? [relative] : []
  })
}

const SPECIFIER = /(?:from\s+|import\s*\(\s*|require\s*\(\s*|^\s*import\s+)["']([^"']+)["']/gm

/** Every import of a file: `@/…` and relative ones resolved to repo paths, packages as written. */
function imports(file: string): string[] {
  const source = readFileSync(path.join(ROOT, file), "utf8")
  return [...source.matchAll(SPECIFIER)].map(([, specifier]) => {
    if (specifier.startsWith("@/")) return specifier.slice(2)
    if (specifier.startsWith(".")) return path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier))
    return `package:${specifier}`
  })
}

const isCore = (file: string) => (CORE_LIB.test(file) || file.startsWith("components/") || file.startsWith("app/")) && !AGENT_UI.test(file) && !AGENT_ROUTES.test(file)
const isAgentUi = (target: string) => /(^|\/)_agent(\/|$)/.test(target)
const isPackage = (target: string, names: readonly string[]) => names.some((name) => target === `package:${name}` || target.startsWith(`package:${name}/`))

function violations(rule: (file: string) => boolean, forbidden: (target: string) => boolean) {
  return files("")
    .filter(rule)
    .flatMap((file) => imports(file).filter(forbidden).map((target) => `${file} → ${target}`))
    .filter((entry) => !ALLOWED.some(([from, to]) => from.test(entry.split(" → ")[0]) && to.test(entry.split(" → ")[1])))
}

describe("AI layer boundary (PLAN-AGENT-00)", () => {
  it("finds the files it checks", () => {
    expect(files("").filter(isCore).length).toBeGreaterThan(100)
    expect(imports("proxy.ts")).toContain("lib/i18n/locale-path")
  })

  it("core never imports the AI layer or the assistant UI", () => {
    expect(violations(isCore, (target) => AI_LAYER.test(target) || isAgentUi(target))).toEqual([])
  })

  it("the assistant and the email agent never import each other", () => {
    expect(violations((file) => file.startsWith("lib/assistant/"), (target) => /^(lib\/mail-agent|workflows|emails)(\/|$)/.test(target) || isPackage(target, ["server-only"]))).toEqual([])
    expect(violations((file) => /^(lib\/mail-agent|workflows|emails)\//.test(file), (target) => /^lib\/assistant(\/|$)/.test(target) || isAgentUi(target))).toEqual([])
  })

  it("lib/ai stays isomorphic: no React, Next.js, server-only or agent code", () => {
    const forbidden = (target: string) =>
      isPackage(target, ["react", "react-dom", "next", "server-only"]) || /^(lib\/(assistant|mail-agent)|workflows|emails|app)(\/|$)/.test(target)
    expect(violations((file) => file.startsWith("lib/ai/"), forbidden)).toEqual([])
  })
})

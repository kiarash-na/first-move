import { readFileSync } from "node:fs"
import path from "node:path"

import type { Page } from "@playwright/test"

const AXE = readFileSync(path.join(process.cwd(), "node_modules/axe-core/axe.min.js"), "utf8")

/** WCAG 2.2 AA (includes the 4.5:1 contrast rule) plus axe's best practices, as in a11y.spec.ts. */
export const AXE_RULES = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]

interface Violation {
  id: string
  nodes: { target: string[] }[]
}

/**
 * Runs axe on the page and returns one line per violating node. `except` turns single rules off
 * where a finding is by design (say why at the call site).
 */
export async function axeViolations(page: Page, { except = [] }: { except?: string[] } = {}): Promise<string[]> {
  await page.addScriptTag({ content: AXE })
  const found = await page.evaluate(
    async ({ tags, off }) => {
      const axe = (window as unknown as { axe: { run: (context: Document, options: object) => Promise<{ violations: Violation[] }> } }).axe
      const rules = Object.fromEntries(off.map((id) => [id, { enabled: false }]))
      return (await axe.run(document, { runOnly: tags, rules })).violations
    },
    { tags: AXE_RULES, off: except },
  )
  return found.flatMap((violation) => violation.nodes.map((node) => `${violation.id}: ${node.target.join(" ")}`))
}

import "server-only"
import { Fragment, isValidElement, type ReactElement, type ReactNode } from "react"

/**
 * The plain-text version of a template (PLAN-AGENT-07 step 10), from the same element tree as the
 * HTML: blocks become lines, paragraphs and sections get a blank line, list items a dash, table
 * cells are joined on one line, and a link shows its address after the label. Decorative parts
 * (`aria-hidden`), `head` and `style` are left out.
 */

const PARAGRAPH = new Set(["p", "h1", "h2", "h3", "h4", "table", "ul", "ol", "section", "blockquote"])
const LINE = new Set(["div", "tr", "li", "dt", "dd", "pre"])
const SKIP = new Set(["head", "style", "title", "meta"])

/** Markers that survive whitespace collapsing until the final layout. */
const BREAK = "\u0001"
const BLANK = "\u0002"

function walk(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number" || typeof node === "bigint") return String(node).replace(/\s+/g, " ")
  if (Array.isArray(node)) return node.map(walk).join("")
  if (!isValidElement(node)) return ""
  const { type, props } = node as ReactElement<Record<string, unknown>>
  if (type === Fragment) return walk(props.children as ReactNode)
  if (typeof type === "function") return walk((type as (props: unknown) => ReactNode)(props))
  if (typeof type !== "string" || SKIP.has(type) || props["aria-hidden"] === "true" || props["aria-hidden"] === true) return ""
  if (type === "br") return BREAK
  if (type === "hr") return `${BLANK}----${BLANK}`
  const inner = walk(props.children as ReactNode)
  if (type === "a") {
    const href = String(props.href ?? "")
    const label = inner.trim()
    const address = href.replace(/^mailto:/i, "")
    return !href || label === address || label === href ? label || address : `${label} (${address})`
  }
  if (type === "li") return `${BREAK}- ${inner.trim()}${BREAK}`
  if (type === "td" || type === "th") return `${inner.trim()}\t`
  if (PARAGRAPH.has(type)) return `${BLANK}${inner}${BLANK}`
  if (LINE.has(type)) return `${BREAK}${inner}${BREAK}`
  return inner
}

/** Renders a node to plain text with at most one blank line between blocks. */
export function renderText(node: ReactNode): string {
  const raw = walk(node)
  return raw
    .replace(/\t+(?=\u0001|\u0002|$)/g, "")
    .split(BLANK)
    .map((block) =>
      block
        .split(BREAK)
        .map((line) =>
          line
            .replace(/[  ]+/g, " ")
            .replace(/ ?\t+ ?/g, "  ")
            .trim(),
        )
        .filter(Boolean)
        .join("\n"),
    )
    .filter(Boolean)
    .join("\n\n")
}

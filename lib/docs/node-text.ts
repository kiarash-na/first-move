import { isValidElement, type ReactNode } from "react"

/**
 * The plain text of rendered children, for a heading id: strings and numbers as they are,
 * elements by their children, booleans and null as nothing.
 */
export function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number" || typeof node === "bigint") return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join("")
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children)
  return ""
}

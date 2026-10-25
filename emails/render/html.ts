import "server-only"
import { Fragment, isValidElement, type ReactElement, type ReactNode } from "react"

/**
 * Static HTML for the email templates (PLAN-AGENT-07 step 10). Next.js refuses `react-dom/server`
 * in route handlers and workflow steps (the react-server layer), so the templates, which are
 * plain synchronous function components without hooks, are rendered here: every text and every
 * attribute value is escaped, unknown or event attributes are refused, and links must be
 * `https:` or `mailto:`. Model and user text can therefore never become markup.
 */

const VOID = new Set(["br", "hr", "img", "meta", "col", "link"])
const TAG = /^[a-z][a-z0-9]*$/
const ATTRIBUTE = /^[a-zA-Z][a-zA-Z0-9:-]*$/
const RENAMED: Record<string, string> = { className: "class", htmlFor: "for", charSet: "charset", httpEquiv: "http-equiv", cellPadding: "cellpadding", cellSpacing: "cellspacing", colSpan: "colspan", rowSpan: "rowspan" }
const UNITLESS = new Set(["lineHeight", "fontWeight", "opacity", "zIndex", "flexGrow", "flexShrink", "order"])
const SAFE_LINK = /^(https:\/\/|mailto:)/i

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ESCAPES[char])
}

const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)

/** A style object as an inline `style` value; values may not close the declaration. */
export function styleText(style: Record<string, string | number | undefined | null>): string {
  return Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([name, value]) => {
      const text = typeof value === "number" && !UNITLESS.has(name) ? `${value}px` : String(value)
      if (/[;{}<>]/.test(text)) throw new Error(`Unsafe style value for ${name}`)
      return `${kebab(name)}:${text}`
    })
    .join(";")
}

function attributes(props: Record<string, unknown>): string {
  let out = ""
  for (const [name, value] of Object.entries(props)) {
    if (name === "children" || name === "key" || value === undefined || value === null || value === false) continue
    if (name === "dangerouslySetInnerHTML") throw new Error("Raw HTML is not allowed in email templates")
    if (/^on[A-Z]/.test(name) || !ATTRIBUTE.test(name)) throw new Error(`Attribute not allowed: ${name}`)
    if (name === "style") {
      const css = styleText(value as Record<string, string | number>)
      if (css) out += ` style="${escapeHtml(css)}"`
      continue
    }
    if (name === "href" && !SAFE_LINK.test(String(value))) continue
    const attribute = RENAMED[name] ?? name
    out += value === true ? ` ${attribute}` : ` ${attribute}="${escapeHtml(String(value))}"`
  }
  return out
}

/** Renders a node to an HTML string. Function components are called with their props. */
export function renderHtml(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number" || typeof node === "bigint") return escapeHtml(String(node))
  if (Array.isArray(node)) return node.map(renderHtml).join("")
  if (!isValidElement(node)) throw new Error("Unsupported node in an email template")
  const element = node as ReactElement<Record<string, unknown>>
  const { type, props } = element
  if (type === Fragment) return renderHtml(props.children as ReactNode)
  if (typeof type === "function") return renderHtml((type as (props: unknown) => ReactNode)(props))
  if (typeof type !== "string" || !TAG.test(type)) throw new Error("Unsupported element in an email template")
  const open = `<${type}${attributes(props)}>`
  if (VOID.has(type)) return open
  return `${open}${renderHtml(props.children as ReactNode)}</${type}>`
}

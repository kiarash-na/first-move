import { allowedUrl, SITE_LINKS, type LinkPolicy } from "@/lib/ai/text/links"

/**
 * The small Markdown subset the assistant's answers may use (D-51, PLAN-AGENT-05 step 8):
 * paragraphs, line breaks, lists, **bold**, `code` and links to First Move pages. Everything else
 * stays plain text: no HTML, no images, no tables, no other links. The result is data for React
 * to render as text nodes, so nothing a model writes can become markup.
 */
export type Inline = { type: "text"; text: string } | { type: "strong"; text: string } | { type: "code"; text: string } | { type: "link"; text: string; href: string }

export type Block = { type: "paragraph"; inline: Inline[] } | { type: "list"; ordered: boolean; items: Inline[][] }

const LIST_ITEM = /^\s{0,3}(?:([-*+•])|(\d{1,3})[.)])\s+(.*)$/
const HEADING = /^\s{0,3}#{1,6}\s+(.*?)\s*#*\s*$/
const TOKEN = /\*\*([^*\n]+?)\*\*|`([^`\n]+)`|(!?)\[([^\]\n]*)\]\(\s*<?([^\s<>()]+)>?(?:\s+"[^"\n]*")?\s*\)/g

/** A link target as an in-app path, or null when the policy does not allow it. */
export function sitePath(href: string, policy: LinkPolicy = SITE_LINKS): string | null {
  const url = allowedUrl(href, policy)
  if (!url) return null
  const parsed = new URL(url)
  return `${parsed.pathname}${parsed.search}${parsed.hash}`
}

export function parseInline(text: string, policy: LinkPolicy = SITE_LINKS): Inline[] {
  const out: Inline[] = []
  const push = (part: Inline) => {
    const last = out.at(-1)
    if (part.type === "text" && last?.type === "text") last.text += part.text
    else if (part.type !== "text" || part.text) out.push(part)
  }
  let at = 0
  for (const match of text.matchAll(TOKEN)) {
    push({ type: "text", text: text.slice(at, match.index) })
    const [whole, strong, code, image, label, href] = match
    if (strong !== undefined) push({ type: "strong", text: strong })
    else if (code !== undefined) push({ type: "code", text: code })
    else {
      const path = image ? null : sitePath(href, policy)
      push(path && label.trim() ? { type: "link", text: label, href: path } : { type: "text", text: label || "" })
    }
    at = match.index + whole.length
  }
  push({ type: "text", text: text.slice(at) })
  return out
}

export function parseMarkdown(text: string, policy: LinkPolicy = SITE_LINKS): Block[] {
  const blocks: Block[] = []
  let paragraph: string[] = []
  let list: { ordered: boolean; items: string[] } | null = null
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", inline: parseInline(paragraph.join("\n"), policy) })
    paragraph = []
  }
  const flushList = () => {
    if (list) blocks.push({ type: "list", ordered: list.ordered, items: list.items.map((item) => parseInline(item, policy)) })
    list = null
  }
  for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
    const item = LIST_ITEM.exec(line)
    if (item) {
      flushParagraph()
      const ordered = item[2] !== undefined
      if (list && list.ordered !== ordered) flushList()
      list ??= { ordered, items: [] }
      list.items.push(item[3])
      continue
    }
    if (!line.trim()) {
      flushParagraph()
      flushList()
      continue
    }
    if (list && /^\s{2,}\S/.test(line)) {
      list.items[list.items.length - 1] += ` ${line.trim()}`
      continue
    }
    flushList()
    const heading = HEADING.exec(line)
    if (heading) {
      flushParagraph()
      blocks.push({ type: "paragraph", inline: [{ type: "strong", text: heading[1] }] })
      continue
    }
    paragraph.push(line)
  }
  flushParagraph()
  flushList()
  return blocks
}

/**
 * The inline markup of legal text: `**bold**`, `` `code` `` and `[label](href)`. A parser, not a
 * renderer: the component turns tokens into React elements, so no text ever becomes HTML.
 */
export type LinkKind = "internal" | "external" | "mail" | "anchor"

export type InlineToken =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; label: string; href: string; kind: LinkKind }

const PATTERN = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g

/** The kind of a link target, or null when it is not allowed (anything but these four is plain text). */
export function linkKind(href: string): LinkKind | null {
  if (href.startsWith("https://")) return "external"
  if (href.startsWith("mailto:") && href.length > "mailto:".length) return "mail"
  if (href.startsWith("#") && href.length > 1) return "anchor"
  if (href.startsWith("/") && !href.startsWith("//")) return "internal"
  return null
}

/** Adds text, joining it to a text token that comes right before it. */
function pushText(tokens: InlineToken[], value: string) {
  const last = tokens.at(-1)
  if (last?.type === "text") last.value += value
  else tokens.push({ type: "text", value })
}

export function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = []
  let cursor = 0

  for (const match of text.matchAll(PATTERN)) {
    const [whole, strong, code, label, href] = match
    if (match.index > cursor) pushText(tokens, text.slice(cursor, match.index))
    cursor = match.index + whole.length

    if (strong !== undefined) tokens.push({ type: "strong", value: strong })
    else if (code !== undefined) tokens.push({ type: "code", value: code })
    else {
      const kind = linkKind(href)
      // A target outside the allowed list (javascript:, data:, //host) stays visible text.
      if (kind) tokens.push({ type: "link", label, href, kind })
      else pushText(tokens, whole)
    }
  }

  if (cursor < text.length) pushText(tokens, text.slice(cursor))
  return tokens
}

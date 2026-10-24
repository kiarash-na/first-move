import "server-only"

const NAMED: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " }

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z]{2,8});/gi, (match, entity: string) => {
    if (entity[0] !== "#") return NAMED[entity.toLowerCase()] ?? match
    const code = entity[1] === "x" || entity[1] === "X" ? Number.parseInt(entity.slice(2), 16) : Number(entity.slice(1))
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ""
  })
}

/**
 * The text of an HTML-only email (most mail has a plain-text part; this is the fallback): no
 * scripts, styles or comments, line breaks for blocks, tags removed, entities decoded. The result
 * is plain text and is never rendered as HTML.
 */
export function htmlToText(html: string): string {
  const text = html
    .replace(/<(script|style|head|title)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(/<\/(p|div|tr|h[1-6]|blockquote|table|section|article|ul|ol)\s*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
  return decodeEntities(text)
    .replace(/[^\S\n]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

import { sanitizeText } from "../text/sanitize"

export const FILE_NAME_CHARS = 200

/**
 * A file name safe to show, log and quote in a prompt: the last path segment only, without
 * invisible or control characters (no bidi tricks such as `fdp.exe` shown as `exe.pdf`), single
 * spaces, at most 200 characters. An empty result becomes "document".
 */
export function cleanFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? ""
  const clean = sanitizeText(base).text.replace(/\s+/g, " ").trim()
  return Array.from(clean).slice(0, FILE_NAME_CHARS).join("") || "document"
}

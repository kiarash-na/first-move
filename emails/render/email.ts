import "server-only"
import type { ReactElement } from "react"
import { renderHtml } from "./html"
import { renderText } from "./text"

/** Gmail clips messages above about 102 KB of HTML; the agent's emails stay well below. */
export const MAX_HTML_BYTES = 90_000

export interface RenderedEmail {
  html: string
  text: string
}

/**
 * One template rendered twice (PLAN-AGENT-07 step 10): the HTML document and its plain-text
 * version. Throws when the HTML outgrows the size limit, so a runaway email is never sent.
 */
export function renderEmail(template: ReactElement): RenderedEmail {
  const html = `<!DOCTYPE html>${renderHtml(template)}`
  if (Buffer.byteLength(html, "utf8") > MAX_HTML_BYTES) throw new Error("The email is larger than the size limit")
  return { html, text: renderText(template) }
}

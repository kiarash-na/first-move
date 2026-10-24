/** Origins model text may link to. The email agent passes its `SITE_URL` origin. */
export interface LinkPolicy {
  origins: readonly string[]
}

export const SITE_LINKS: LinkPolicy = { origins: ["https://firstmove.energy"] }

/** Site paths that may appear relative (`/en/docs/quick-check`); they resolve against the first origin. */
const LOCALE_PATH = /^\/(?:en|de)(?:[/?#]|$)/

/**
 * The URL, absolute and normalized, if model text may show it as a link (PLAN-AGENT-03 step 1):
 * an allow-listed origin (scheme, host and port) without credentials, or a relative `/en/…` or
 * `/de/…` path. Anything else gives null: other hosts, look-alike hosts, `javascript:`, `data:`.
 */
export function allowedUrl(href: string, policy: LinkPolicy = SITE_LINKS): string | null {
  const value = href.trim()
  if (!value || /[\s\p{Cc}\\]/u.test(value)) return null
  if (value.startsWith("/")) {
    const [base] = policy.origins
    return base && LOCALE_PATH.test(value) ? new URL(value, base).href : null
  }
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }
  if (url.username || url.password) return null
  return policy.origins.includes(url.origin) ? url.href : null
}

/** Plain text that no mail client turns into a link: no scheme, dots of the host as `[.]`. */
export function defang(href: string): string {
  const rest = href.replace(/^[a-z][a-z0-9+.-]*:\/*/i, "")
  const cut = rest.search(/[/?#]/)
  const host = cut === -1 ? rest : rest.slice(0, cut)
  return host.replaceAll(".", "[.]") + (cut === -1 ? "" : rest.slice(cut))
}

const MARKDOWN_LINK = /(!?)\[([^\]\n]*)\]\(\s*<?([^\s<>()]*)>?(?:\s+(?:"[^"\n]*"|'[^'\n]*'))?\s*\)/g
const AUTOLINK = /<([a-z][a-z0-9+.-]*:[^\s<>]+)>/gi
const BARE_URL = /\b(?:[a-z][a-z0-9+.-]*:\/\/|www\.)[^\s<>"'`)\]]+/gi
const HELD = /\u{E000}(\d+)\u{E001}/gu

/**
 * Model text with links only where the policy allows them (PLAN-AGENT-03 step 1). A Markdown
 * link to another place keeps its text, an image keeps its alt text (no remote images), and a
 * bare or angle-bracket URL to another place is defanged, so an injected phishing link is never
 * clickable, in the app or in a mail client.
 */
export function restrictLinks(text: string, policy: LinkPolicy = SITE_LINKS): string {
  const held: string[] = []
  const hold = (value: string) => `\u{E000}${held.push(value) - 1}\u{E001}`

  const bare = (input: string) =>
    input.replace(BARE_URL, (match) => {
      const url = match.replace(/[.,;:!?]+$/, "")
      const trail = match.slice(url.length)
      const allowed = allowedUrl(url.startsWith("www.") ? `https://${url}` : url, policy)
      return (allowed ? hold(url) : defang(url)) + trail
    })

  const out = text
    .replace(/[\u{E000}\u{E001}]/gu, "")
    .replace(MARKDOWN_LINK, (_, image: string, label: string, href: string) => {
      const url = image ? null : allowedUrl(href, policy)
      if (url) return hold(`[${bare(label)}](${url})`)
      return label.trim() ? label : href ? defang(href) : ""
    })
    .replace(AUTOLINK, (_, href: string) => {
      const url = allowedUrl(href, policy)
      return url ? hold(`<${url}>`) : defang(href)
    })
  return bare(out).replace(HELD, (_, index: string) => held[Number(index)])
}

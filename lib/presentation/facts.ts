/**
 * Facts slide 10 states, as the owner gave them (2026-10-25): what First Move cost to make and
 * what it costs to run. Numbers, so the page formats them per language (`lib/i18n/format`).
 */
export const COST = {
  /** Euros spent to build it, about. */
  buildEur: 180,
  /** Euros a month to run it, about, for up to `activeUsers` active users a month. Maintenance excluded. */
  runEurPerMonth: 5,
  activeUsers: 1_000,
} as const

/** "Powered by /1Slash", a human and AI service. */
export const ONE_SLASH = { name: "/1Slash", url: "https://1sla.sh/" } as const

/** Display form of a URL: no scheme, no trailing slash. */
export const displayUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "")

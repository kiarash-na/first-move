/**
 * Canonical origin of the public site: the www host (the apex redirects to it, see the email
 * agent's live note). SITE_URL overrides it on preview deployments; the mail agent validates
 * the same variable for its own links.
 */
export function siteUrl(): string {
  return (process.env.SITE_URL || "https://www.firstmove.energy").replace(/\/+$/, "")
}

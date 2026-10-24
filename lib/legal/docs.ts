/**
 * The legal documents, in footer order. The slug is the URL segment (`/en/terms`) and also the
 * dictionary area that holds the text.
 */
export const LEGAL_DOCS = ["terms", "privacy", "cookies", "imprint", "ai", "license"] as const

export type LegalSlug = (typeof LEGAL_DOCS)[number]

export function isLegalSlug(value: unknown): value is LegalSlug {
  return typeof value === "string" && (LEGAL_DOCS as readonly string[]).includes(value)
}

/** Labels for the six links, as the `legal` dictionary and the landing dictionary hold them. */
export type LegalLinkLabels = Record<LegalSlug, string>

/**
 * The anchor id of a docs heading: accents and umlauts folded (NFKD, marks dropped), lower case,
 * only letters, digits, spaces and hyphens kept, spaces turned into hyphens. It must equal
 * `slugify()` in `scripts/gen-knowledge.mjs`, because the knowledge index links to
 * `/{lang}/docs/{slug}#{anchor}` (PLAN-AGENT-03); `scripts/heading-anchors.test.ts` checks both.
 * Core code may not import the script, so the rule lives here a second time.
 */
export function headingId(heading: string): string {
  return heading
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
}

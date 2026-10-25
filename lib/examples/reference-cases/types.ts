import { text, type ExampleDefinition, type Localized } from "../types"

/** A real anergy network in Vienna, or a fictional plan around a real Vienna building (D-76). */
export const REFERENCE_KINDS = ["real", "fictional"] as const
export type ReferenceKind = (typeof REFERENCE_KINDS)[number]

/** The plan quality each case is written to show, one per group (D-76). */
export const REFERENCE_TIERS = ["weak", "middling", "strong"] as const
export type ReferenceTier = (typeof REFERENCE_TIERS)[number]

/**
 * What the start screen shows of a case: plain data without the plan, so the cards load with the
 * start screen and the full case loads only when someone opens it (`catalog.ts`).
 */
export interface ReferenceCaseCard {
  /** Becomes `meta.exampleId`, like an example's id. */
  id: string
  kind: ReferenceKind
  tier: ReferenceTier
  /** Also the heading of the case on the public docs page, so the card can link to its section. */
  name: Localized
  /** One sentence for the start screen. */
  summary: Localized
}

/**
 * A reference case: an example project (it loads exactly like one, `localizeExample`) plus its
 * kind, its designed tier and the sources it cites. Every fact about a real building comes from a
 * source in `sources.ts` (or `lib/docs/references.ts`); invented details of a fictional plan are
 * marked "(illustrative)", proposals for a real project "(proposed)".
 */
export interface ReferenceCase extends ExampleDefinition, ReferenceCaseCard {
  /**
   * The sources it cites: ids in `REFERENCE_CASE_SOURCES` or `REFERENCES`, in the order the case
   * uses them. (`sources` is taken: it holds the Quick Check energy sources of the example.)
   */
  references: readonly string[]
}

/**
 * The plain sentence every fictional case carries (owner's rule, 2026-10-25): in the project it
 * opens, on its card and in its docs section.
 */
export const FICTIONAL_DISCLAIMER: Localized = text(
  "Fictional business plan around a real building: neither the owner nor the operator has planned or endorsed it.",
  "Fiktiver Businessplan rund um ein reales Gebäude: Weder Eigentümer noch Betreiber haben ihn geplant oder befürwortet.",
)

/**
 * A fictional case's ownership text: the disclaimer first, then the case's own text, so the
 * project that opens says it in its first sentence on the site step.
 */
export const withFictionalDisclaimer = (en: string, de: string): Localized =>
  text(`${FICTIONAL_DISCLAIMER.en} ${en}`, `${FICTIONAL_DISCLAIMER.de} ${de}`)

/** One legal document as it sits in its dictionary area (`dictionaries/<lang>/<slug>.json`). */
export interface LegalSection {
  /** Anchor in the page and in the table of contents; the same in EN and DE. */
  id: string
  heading: string
  /** Lines in the grammar of `parse-blocks.ts`. */
  body: string[]
}

export interface LegalDocCopy {
  meta: { title: string; description: string }
  title: string
  /** Opening paragraph under the title, in the grammar of `inline.ts`. */
  intro: string
  /** ISO date of the last substantive change; shown through `formatDate`. */
  updated: string
  /** Document version, bumped with every substantive change. */
  version: string
  sections: LegalSection[]
}

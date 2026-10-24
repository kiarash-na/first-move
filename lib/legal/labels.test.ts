import { describe, expect, it } from "vitest"

import deLanding from "@/dictionaries/de/landing.json"
import deLegal from "@/dictionaries/de/legal.json"
import enLanding from "@/dictionaries/en/landing.json"
import enLegal from "@/dictionaries/en/legal.json"
import { LEGAL_DOCS } from "./docs"

describe("legal link labels", () => {
  it.each([
    ["en", enLanding.closing.footer.legal, enLegal],
    ["de", deLanding.closing.footer.legal, deLegal],
  ] as const)("the landing footer and the site footer use the same words (%s)", (_lang, landing, legal) => {
    for (const slug of LEGAL_DOCS) expect(landing[slug], slug).toBe(legal.docs[slug])
    expect(landing.nav).toBe(legal.footer.nav)
    expect(landing.source).toBe(legal.footer.source)
  })
})

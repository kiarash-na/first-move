// @vitest-environment node
import { describe, expect, it } from "vitest"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { LOCALES, type Locale } from "@/lib/i18n/locales"
import { SIDEBAR_STORAGE_KEY } from "@/lib/dashboard/sidebar-state"
import { DB_NAME, MIRROR_PREFIX, STORE, ACTIVE_PROJECT_KEY, LAST_PROJECT_KEY, TAB_CHANNEL } from "@/lib/storage/keys"
import { THEME_STORAGE_KEY } from "@/lib/theme/theme"
import { LOCALE_COOKIE } from "@/lib/i18n/locales"
import { LEGAL_DOCS, type LegalSlug } from "./docs"
import { interpolate } from "./interpolate"
import type { AiStatus } from "./ai"
import { NOTICE_ACK_KEY } from "./notice"
import { AUTHORITY, LICENSE, OPERATOR, PROCESSORS } from "./operator"
import type { LegalDocCopy } from "./types"

/** The whole document as one searchable string, tokens resolved. */
async function fullText(lang: Locale, slug: LegalSlug): Promise<string> {
  const doc = (await getDictionary(lang, slug)) as unknown as LegalDocCopy
  return interpolate([doc.title, doc.intro, ...doc.sections.flatMap((section) => [section.heading, ...section.body])].join("\n"), lang)
}

describe.each(LOCALES)("legal facts (%s)", (lang) => {
  it("Imprint names the operator, address, VAT ID and both mailboxes (§ 5 DDG)", async () => {
    const text = await fullText(lang, "imprint")
    for (const fact of [OPERATOR.name, OPERATOR.tradeName, OPERATOR.postBox, OPERATOR.postcode, OPERATOR.city, OPERATOR.vatId, OPERATOR.emailHuman, OPERATOR.emailAgent]) {
      expect(text, fact).toContain(fact)
    }
  })

  it("Privacy names the controller, the processors and the supervisory authority (GDPR Art. 13)", async () => {
    const text = await fullText(lang, "privacy")
    for (const fact of [OPERATOR.name, OPERATOR.postBox, OPERATOR.emailHuman, OPERATOR.emailAgent, PROCESSORS.hosting.name, PROCESSORS.mail.name, AUTHORITY.name]) {
      expect(text, fact).toContain(fact)
    }
  })

  it("Cookie Policy lists every key First Move keeps in the browser", async () => {
    const text = await fullText(lang, "cookies")
    const keys = [
      LOCALE_COOKIE,
      THEME_STORAGE_KEY,
      SIDEBAR_STORAGE_KEY,
      `${MIRROR_PREFIX}`,
      ACTIVE_PROJECT_KEY,
      LAST_PROJECT_KEY,
      NOTICE_ACK_KEY,
      TAB_CHANNEL,
      DB_NAME,
      ...Object.values(STORE),
    ]
    for (const key of keys) expect(text, key).toContain(key)
  })

  it("Terms carry the two responsible-AI clauses, the liability section and the governing law", async () => {
    const doc = (await getDictionary(lang, "terms")) as unknown as LegalDocCopy
    const ids = doc.sections.map((section) => section.id)
    for (const id of ["responsible-ai", "human-led-feedback", "liability", "governing-law", "successors"]) {
      expect(ids, id).toContain(id)
    }
  })

  it("AI page says what the functions are and carries a status for every state", async () => {
    const doc = (await getDictionary(lang, "ai")) as unknown as LegalDocCopy & { status: Record<AiStatus, string> }
    for (const state of ["planned", "score", "live"] as const) expect(doc.status[state].trim(), state).not.toBe("")
    const ids = doc.sections.map((section) => section.id)
    for (const id of ["plan-score", "functions", "risk-classification", "transparency", "human-oversight", "responsible-ai"]) {
      expect(ids, id).toContain(id)
    }
  })

  it("AI page and Privacy Policy describe the AI Plan Score and its recipients", async () => {
    const ai = await fullText(lang, "ai")
    const privacy = await fullText(lang, "privacy")
    for (const fact of ["Vercel AI Gateway", "TypeSafe AI", "Jev", "Art. 50"]) expect(ai, fact).toContain(fact)
    for (const fact of [PROCESSORS.hosting.name, "TypeSafe AI, Inc.", "ai-gateway.vercel.sh", "Art. 45"]) expect(privacy, fact).toContain(fact)
    const doc = (await getDictionary(lang, "privacy")) as unknown as LegalDocCopy
    expect(doc.sections.map((section) => section.id)).toContain("ai-plan-score")
  })

  it("Cookie Policy names the AI Gateway in its connection rules", async () => {
    expect(await fullText(lang, "cookies")).toContain("Vercel AI Gateway")
  })

  it("Licence page names the licence and the font licence", async () => {
    const text = await fullText(lang, "license")
    expect(text).toContain(LICENSE.spdx)
    expect(text).toContain("OFL")
  })

  it("never links to the discontinued EU ODR platform", async () => {
    for (const slug of LEGAL_DOCS) expect(await fullText(lang, slug), slug).not.toMatch(/ec\.europa\.eu\/(consumers\/)?odr/i)
  })
})

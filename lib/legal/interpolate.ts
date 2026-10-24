import type { Locale } from "@/lib/i18n/locales"
import { AUTHORITY, COPYRIGHT_YEAR, LICENSE, OPERATOR, PROCESSORS, REPOSITORY, SITE } from "./operator"

/**
 * Values that legal text can name with `{{token}}`. Facts live in `operator.ts`, so a change of
 * operator, address or provider is one edit and every page follows.
 */
export const LEGAL_TOKENS: Readonly<Record<string, string>> = {
  "operator.name": OPERATOR.name,
  "operator.tradeName": OPERATOR.tradeName,
  "operator.vatId": OPERATOR.vatId,
  "operator.postBox": OPERATOR.postBox,
  "operator.postcode": OPERATOR.postcode,
  "operator.city": OPERATOR.city,
  "operator.country": OPERATOR.country,
  "operator.address": `${OPERATOR.postBox}, ${OPERATOR.postcode} ${OPERATOR.city}, ${OPERATOR.country}`,
  "operator.emailHuman": OPERATOR.emailHuman,
  "operator.emailAgent": OPERATOR.emailAgent,
  "copyright.year": COPYRIGHT_YEAR,
  "site.domain": SITE.domain,
  "site.url": SITE.url,
  "repo.url": REPOSITORY.url,
  "repo.licenseUrl": REPOSITORY.licenseUrl,
  "license.spdx": LICENSE.spdx,
  "license.name": LICENSE.name,
  "license.url": LICENSE.url,
  "authority.name": AUTHORITY.name,
  "authority.address": AUTHORITY.address,
  "authority.url": AUTHORITY.url,
  "hosting.name": PROCESSORS.hosting.name,
  "hosting.country": PROCESSORS.hosting.country,
  "hosting.url": PROCESSORS.hosting.url,
  "mail.name": PROCESSORS.mail.name,
  "mail.country": PROCESSORS.mail.country,
  "mail.region": PROCESSORS.mail.region,
  "mail.url": PROCESSORS.mail.url,
}

/** Values that read differently in German: the country is named in the language of the page. */
const GERMAN: Readonly<Record<string, string>> = {
  "operator.country": "Deutschland",
  "operator.address": `${OPERATOR.postBox}, ${OPERATOR.postcode} ${OPERATOR.city}, Deutschland`,
  "authority.address": AUTHORITY.address.replace(/Germany$/, "Deutschland"),
  "mail.region": "EU-Region",
}

const TOKEN = /\{\{\s*([\w.]+)\s*\}\}/g

/** Replaces every `{{token}}`. An unknown token throws, so a typo cannot reach a published page. */
export function interpolate(text: string, lang: Locale = "en"): string {
  const values = lang === "de" ? { ...LEGAL_TOKENS, ...GERMAN } : LEGAL_TOKENS
  return text.replace(TOKEN, (_match, name: string) => {
    const value = values[name]
    if (value === undefined) throw new Error(`Unknown legal token {{${name}}}`)
    return value
  })
}

/** The token names used in a text, for tests. */
export function tokensIn(text: string): string[] {
  return [...text.matchAll(TOKEN)].map((match) => match[1])
}

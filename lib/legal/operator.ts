/**
 * Who runs First Move: the one place for every legal fact (D-39 to D-46). The legal pages, the
 * footer, the NOTICE file and `package.json` take their identity from here, through the
 * `{{token}}` values in `interpolate.ts`.
 *
 * When the operator becomes a company, change this file and follow the transition checklist in
 * `docs/90_work/notes/2026-10-24_phase-12_legal.md`.
 *
 * Known gaps the owner accepted (D-45), each of them a risk under German law:
 * - `postBox`: only a P.O. box is given. § 5 DDG asks for a serviceable street address.
 * - `name`: the surname is abbreviated. § 5 DDG asks for the full first name and surname.
 * - Contact: two e-mail addresses and no telephone number as a second channel.
 */
export const OPERATOR = {
  /** The legal person behind the service: an individual for now. */
  name: "Kiarash N.A.",
  /** Not registered as a business name or trademark. */
  tradeName: "First Move",
  vatId: "DE365576746",
  postBox: "Postfach 13 02 66",
  postcode: "20102",
  city: "Hamburg",
  country: "Germany",
  /** Read by a person. Privacy and legal-rights requests go here. */
  emailHuman: "human@mail.firstmove.energy",
  /** Answered by an AI system (AI Act Art. 50(1) disclosure on the Imprint and Privacy pages). */
  emailAgent: "agent@mail.firstmove.energy",
} as const

/** Year of the first publication, for the copyright line in the footer and in NOTICE. */
export const COPYRIGHT_YEAR = "2026"

export const SITE = {
  domain: "firstmove.energy",
  url: "https://firstmove.energy",
} as const

export const REPOSITORY = {
  url: "https://github.com/kiarash-na/first-move",
  licenseUrl: "https://github.com/kiarash-na/first-move/blob/main/LICENSE",
} as const

export const LICENSE = {
  spdx: "Apache-2.0",
  name: "Apache License, Version 2.0",
  url: "https://www.apache.org/licenses/LICENSE-2.0",
} as const

/** The supervisory authority for a controller in Hamburg (GDPR Art. 77). Re-check before launch. */
export const AUTHORITY = {
  name: "Der Hamburgische Beauftragte für Datenschutz und Informationsfreiheit",
  address: "Ludwig-Erhard-Str. 22, 20459 Hamburg, Germany",
  url: "https://datenschutz-hamburg.de",
} as const

/** Service providers that see personal data. Confirm their data processing terms before launch. */
export const PROCESSORS = {
  hosting: { name: "Vercel Inc.", country: "USA", url: "https://vercel.com" },
  mail: { name: "Resend (Resend, Inc.)", country: "USA", region: "EU region", url: "https://resend.com" },
} as const

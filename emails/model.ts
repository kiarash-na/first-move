import type { Locale } from "@/lib/i18n/locales"

/**
 * What an email of the agent says, as plain data (PLAN-AGENT-07 step 10): the conversation code
 * builds it from the dictionaries and the app's own results, and one template renders it to HTML
 * and plain text. Every string is text, never markup: the renderer escapes it.
 */

/** Cyan marks the Quick Check, orange the Business Plan and risks, ink everything else (D-15). */
export type Accent = "cool" | "hot" | "ink"

export type ResultLevel = "promising" | "further_analysis" | "not_promising"

export interface Question {
  number: number
  text: string
  /** "optional", shown after the question. */
  optional?: string
  /** Examples, options and lists, one line each. */
  hints: string[]
}

export interface ValueRow {
  label: string
  value: string
  note?: string
  /** Orange: a risk or a deal-breaker. */
  tone?: "hot"
}

export interface IndicatorItem {
  label: string
  value: string
  classLabel: string
  /** Supporting in cyan, limiting in orange (QCT-KF-05); null when the indicator decides nothing alone. */
  effect: "supporting" | "limiting" | null
  effectLabel?: string
}

export interface CalcNote {
  title: string
  text: string
  /** Equation ids and names, e.g. "EQ-3.6a Heating supply coverage". */
  formulas: string[]
}

export type Block =
  | { type: "text"; text: string; tone?: "muted" | "strong" }
  | { type: "bullets"; items: string[] }
  | { type: "questions"; items: Question[] }
  | { type: "options"; items: { number: number; label: string; description: string }[] }
  | { type: "rows"; title?: string; rows: ValueRow[] }
  | { type: "verdict"; level: ResultLevel; label: string; description: string; badge?: string }
  | { type: "indicators"; items: IndicatorItem[] }
  | { type: "button"; label: string; href: string; hint?: string }
  | { type: "notes"; items: CalcNote[] }

export interface Section {
  kicker: string
  title?: string
  accent: Accent
  blocks: Block[]
}

export interface Footer {
  /** AI disclosure: written by an AI system, may be wrong, not binding. */
  ai: string
  /** Privacy and legal requests, or a person: the human@ line. */
  human: string
  humanAddress: string
  links: { label: string; href: string }[]
  /** How to start over or stop; left out on notices. */
  commands?: string
}

export interface MailMessage {
  locale: Locale
  /** The document title and the hidden preview line. */
  title: string
  preheader: string
  brand: string
  tagline: string
  greeting: string
  sections: Section[]
  signoff: string
  footer: Footer
}

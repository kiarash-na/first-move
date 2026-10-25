import "server-only"
import { newEmailText } from "@/lib/ai/text/email-body"
import type { ModuleChoice } from "./state"

/** Words a reply may consist of to steer the conversation (PLAN-AGENT-07 step 6). */
export type Command = "stop" | "new" | "file" | "next" | "human"

export interface ParsedReply {
  command: Command | null
  /** A menu choice: "1", "2, yes", "both, no", "beides, ja", "Quick Check". */
  module: ModuleChoice | null
  /** A yes or no to the project file, when the reply is short enough to be one. */
  wantsFile: boolean | null
  /** Whether the new text has digits: answers to the Quick Check usually do. */
  hasNumbers: boolean
}

/** A reply this short is read as a command or a menu answer; anything longer is prose. */
const SHORT = 80

const COMMANDS: [Command, RegExp][] = [
  ["stop", /^(?:please\s+|bitte\s+)?(?:stop|stopp|unsubscribe|abmelden|beenden|end|cancel|abbrechen|delete(?: my data)?|lösche?n?(?: meine daten)?)(?:\s+(?:please|bitte))?$/],
  ["new", /^(?:new|neu|restart|start over|start again|neu starten|von vorne|von vorn|neustart)$/],
  ["file", /^(?:file|datei|the file|die datei|project file|projektdatei|send(?: me)? the file|datei senden|schicken sie mir die datei)(?:\s+(?:please|bitte))?$/],
  ["next", /^(?:next|weiter|skip|überspringen|next step|nächster schritt)$/],
]

/** Asking for a person anywhere in the text, in English or German. */
const HUMAN = [
  /\b(?:talk|speak|write|chat)\s+(?:to|with)\s+(?:a\s+)?(?:real\s+)?(?:human|person|someone|somebody|people)\b/,
  /\b(?:real|actual)\s+(?:human|person)\b/,
  /\bhuman\s+(?:please|instead|support)\b/,
  /\b(?:mit\s+)?(?:einem|einer)\s+(?:echten\s+)?(?:menschen|mensch|person|mitarbeiter(?:in)?)\s+(?:sprechen|reden|schreiben)\b/,
  /\bechte[nr]?\s+(?:menschen|mensch|person)\b/,
  /^(?:human|mensch)$/,
]

const MODULES: [ModuleChoice, RegExp][] = [
  ["both", /^(?:3|three|drei|both|beides|beide|all|alles)\b|\bboth\b|\bbeides?\b|quick\s*-?\s*check\s+(?:and|und|\+|&)\s+(?:the\s+|den\s+)?business\s*-?\s*plan/],
  ["quickCheck", /^(?:1|one|eins)\b|^(?:the\s+|den\s+)?quick\s*-?\s*check\b/],
  ["businessPlan", /^(?:2|two|zwei)\b|^(?:the\s+|den\s+)?(?:business\s*-?\s*plan|geschäftsplan|geschäftsmodell)\b/],
]

const YES = /(?:^|[\s,;.:/-])(?:yes|yeah|yep|sure|please|ja|gerne|gern|bitte|klar)(?=$|[\s,;.!])/
const NO = /(?:^|[\s,;.:/-])(?:no|nope|no thanks|nein|nein danke|kein|keine)(?=$|[\s,;.!])/

/** The first line of the new text, lower case, without punctuation at its ends. */
function firstLine(text: string): string {
  const line = text.split("\n").find((entry) => entry.trim()) ?? ""
  return line
    .normalize("NFKC")
    .toLowerCase()
    .replace(/^[\s"'„“”‚‘’*>-]+|[\s"'„“”‚‘’*.!?,;:)]+$/g, "")
    .replace(/\s+/g, " ")
}

/**
 * Reads the deterministic parts of a reply (PLAN-AGENT-07 step 6): a command word on the first
 * line ("stop", "new", "file", "next" and their German words), a request for a person anywhere,
 * a menu choice ("1", "2, yes", "both, no", "beides, ja") and a yes or no to the file. Jev's
 * `intent` covers the free text these rules leave open.
 */
export function parseReply(rawText: string): ParsedReply {
  const text = newEmailText(rawText).text
  const lower = text.normalize("NFKC").toLowerCase()
  const line = firstLine(text)
  const short = line.length <= SHORT
  const command = HUMAN.some((pattern) => pattern.test(lower)) ? "human" : short ? (COMMANDS.find(([, pattern]) => pattern.test(line))?.[0] ?? null) : null
  const choice = short && command === null ? (MODULES.find(([, pattern]) => pattern.test(line))?.[0] ?? null) : null
  const wantsFile = short && command === null ? (NO.test(` ${line}`) ? false : YES.test(` ${line}`) ? true : null) : null
  return { command, module: choice, wantsFile, hasNumbers: /\d/.test(text) }
}

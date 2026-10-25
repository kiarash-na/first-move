import "server-only"
import { newEmailText } from "@/lib/ai/text/email-body"
import type { ModuleChoice } from "./state"

/** Words a reply may consist of to steer the conversation (PLAN-AGENT-07 step 6). */
export type Command = "stop" | "new" | "file" | "next" | "human"

export interface ParsedReply {
  command: Command | null
  /** A menu choice: "1", "2, yes", "both, no", "beides, ja", "Quick Check". */
  module: ModuleChoice | null
  /** The new text is nothing but the menu answer (after a greeting line), so it carries no values. */
  onlyChoice: boolean
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

/**
 * Asking us for a person, in the first person, at the start of a sentence of the first line:
 * "Could I talk to a human?", "I'd like to speak with a real person", "Kann ich bitte mit einem
 * Menschen sprechen?", or just "human". Talking to people in the district is project data.
 */
const HUMAN = [
  /^(?:a\s+)?(?:real\s+|actual\s+)?(?:human|person)(?:\s+(?:please|instead))?$/,
  /^(?:einen?\s+)?(?:echte[nr]?\s+)?(?:mensch(?:en)?|person)(?:\s+bitte)?$/,
  /(?:^|[.!?,;]\s*)(?:please\s+)?(?:can|could|may)\s+i\s+(?:please\s+)?(?:talk|speak|write|chat)\s+(?:to|with)\s+(?:a\s+)?(?:real\s+|actual\s+)?(?:human|person)\b/,
  /(?:^|[.!?,;]\s*)i(?:'d|’d|\s+would)\s+(?:like|prefer)\s+to\s+(?:talk|speak|write|chat)\s+(?:to|with)\s+(?:a\s+)?(?:real\s+|actual\s+)?(?:human|person)\b/,
  /(?:^|[.!?,;]\s*)i\s+(?:want|need)\s+(?:to\s+(?:talk|speak|write|chat)\s+(?:to|with)\s+)?(?:a\s+)?(?:real\s+|actual\s+)?(?:human|person)\b/,
  /(?:^|[.!?,;]\s*)(?:please\s+)?(?:let\s+me\s+(?:talk|speak)\s+(?:to|with)|put\s+me\s+through\s+to|connect\s+me\s+(?:to|with))\s+(?:a\s+)?(?:real\s+|actual\s+)?(?:human|person)\b/,
  /(?:^|[.!?,;]\s*)(?:bitte\s+)?(?:kann|könnte|darf)\s+ich\s+(?:bitte\s+)?(?:auch\s+)?mit\s+(?:einem|einer)\s+(?:echten\s+)?(?:menschen|person|mitarbeiter(?:in)?)\s+(?:sprechen|reden|schreiben)\b/,
  /(?:^|[.!?,;]\s*)ich\s+(?:möchte|würde|will)\s+(?:bitte\s+)?(?:gerne?\s+)?(?:lieber\s+)?mit\s+(?:einem|einer)\s+(?:echten\s+)?(?:menschen|person|mitarbeiter(?:in)?)\s+(?:sprechen|reden|schreiben)\b/,
]

/** What may follow a menu choice on its line: the file answer and polite words ("1, yes", "beides, ja bitte"). */
const TAIL = String.raw`(?:[\s,;.:/–-]+(?:yes|yeah|yep|sure|no|nope|ja|nein|please|bitte|gerne|gern|klar|thanks|danke))*$`
const choice = (pattern: string) => new RegExp(`^(?:${pattern})${TAIL}`)
const NUMBERED = String.raw`(?:option\s+|number\s+|nummer\s+|nr\.?\s*)?`
const QUICK_CHECK = String.raw`(?:the\s+|den\s+)?quick\s*-?\s*check`
const BUSINESS_PLAN = String.raw`(?:the\s+|den\s+)?(?:business\s*-?\s*plan|geschäftsplan|geschäftsmodell)`

/** A menu answer is the whole line: "3,5 ha", "All right" or "One question first" choose nothing. */
const MODULES: [ModuleChoice, RegExp][] = [
  ["both", choice(`${NUMBERED}(?:3|three|drei)|both|beides?|${QUICK_CHECK}\\s+(?:and|und|\\+|&)\\s+${BUSINESS_PLAN}`)],
  ["quickCheck", choice(`${NUMBERED}(?:1|one|eins)|${QUICK_CHECK}`)],
  ["businessPlan", choice(`${NUMBERED}(?:2|two|zwei)|${BUSINESS_PLAN}`)],
]

const YES = /(?:^|[\s,;.:/-])(?:yes|yeah|yep|sure|please|ja|gerne|gern|bitte|klar)(?=$|[\s,;.!])/
const NO = /(?:^|[\s,;.:/-])(?:no|nope|no thanks|nein|nein danke|kein|keine)(?=$|[\s,;.!])/

/** A salutation on a line of its own ("Hi,", "Dear team,", "Hallo Jev!"): the reply starts after it. */
const GREETING = /^(?:hi|hello|hey|dear|good\s+(?:morning|afternoon|evening|day)|hallo|guten\s+(?:tag|morgen|abend)|liebe[rs]?|sehr\s+geehrte[rs]?|moin|servus)\b[^?!:;,]{0,40}[,!]?$/

/** A line in lower case, without punctuation at its ends. */
function cleanLine(line: string): string {
  return line
    .normalize("NFKC")
    .toLowerCase()
    .replace(/^[\s"'„“”‚‘’*>-]+|[\s"'„“”‚‘’*.!?,;:)]+$/g, "")
    .replace(/\s+/g, " ")
}

/**
 * Reads the deterministic parts of a reply (PLAN-AGENT-07 step 6) from the first line of the new
 * text, after a greeting line: a command word ("stop", "new", "file", "next" and their German
 * words), a request for a person, a menu choice ("1", "2, yes", "both, no", "beides, ja") and a
 * yes or no to the file. Jev's `intent` covers the free text these rules leave open.
 */
export function parseReply(rawText: string): ParsedReply {
  const text = newEmailText(rawText).text
  const lines = text.split("\n").map((entry) => entry.trim()).filter(Boolean)
  const start = lines.length > 1 && GREETING.test(lines[0].normalize("NFKC").toLowerCase()) ? 1 : 0
  const line = cleanLine(lines[start] ?? "")
  const short = line.length <= SHORT
  const human = short && HUMAN.some((pattern) => pattern.test(line))
  const command = human ? "human" : short ? (COMMANDS.find(([, pattern]) => pattern.test(line))?.[0] ?? null) : null
  const chosen = short && command === null ? (MODULES.find(([, pattern]) => pattern.test(line))?.[0] ?? null) : null
  const wantsFile = short && command === null ? (NO.test(` ${line}`) ? false : YES.test(` ${line}`) ? true : null) : null
  return { command, module: chosen, onlyChoice: chosen !== null && lines.length === start + 1, wantsFile, hasNumbers: /\d/.test(text) }
}

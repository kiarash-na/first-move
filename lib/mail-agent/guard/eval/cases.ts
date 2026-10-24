import "server-only"
import { readFileSync } from "node:fs"
import path from "node:path"
import { z } from "zod"
import type { InboundEmail } from "../../inbound/transport"
import { THREATS } from "../questions"

/**
 * What the policy should make of a case: `allow`, `small_talk`, an `off_topic` strike, or a
 * `threat` (suspect or block) of the named kind. Only `threat` cases may be blocked.
 */
export const EXPECTED = ["allow", "small_talk", "off_topic", "threat"] as const
export type Expected = (typeof EXPECTED)[number]

const CASE = z
  .object({
    id: z.string().regex(/^[a-z]{2}-[a-z_-]+-\d{2}$/),
    lang: z.enum(["en", "de"]),
    kind: z.string().regex(/^[a-z_]+$/),
    subject: z.string().max(300),
    body: z.string().min(1).max(12_000),
    attachments: z.array(z.object({ name: z.string(), type: z.string(), size: z.number().int().nonnegative() })).max(10).default([]),
    expect: z.enum(EXPECTED),
    threat: z.enum(THREATS).optional(),
  })
  .refine((entry) => (entry.expect === "threat") === (entry.threat !== undefined), { message: "a threat case names its threat, and only a threat case" })

export type EvalCase = z.infer<typeof CASE>

export const CASES_FILE = path.join(process.cwd(), "lib/mail-agent/guard/eval/cases.jsonl")

/** The labelled cases (PLAN-AGENT-06 step 9), one JSON object per line; a bad line names itself. */
export function parseCases(jsonl: string): EvalCase[] {
  return jsonl
    .split("\n")
    .map((line, index) => [line.trim(), index + 1] as const)
    .filter(([line]) => line.length > 0)
    .map(([line, number]) => {
      const parsed = CASE.safeParse(JSON.parse(line))
      if (!parsed.success) throw new Error(`cases.jsonl line ${number}: ${parsed.error.issues.map((issue) => issue.message).join("; ")}`)
      return parsed.data
    })
}

export const loadCases = (file = CASES_FILE) => parseCases(readFileSync(file, "utf8"))

/** A case as the received email `guardState` reads. */
export function caseEmail(entry: EvalCase): Pick<InboundEmail, "subject" | "text" | "attachments"> {
  return {
    subject: entry.subject,
    text: entry.body,
    attachments: entry.attachments.map((file, index) => ({ id: `att-${index}`, name: file.name, size: file.size, contentType: file.type })),
  }
}

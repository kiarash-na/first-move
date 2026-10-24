import type { z } from "zod"
import { getAt, joinPath } from "./path"

/**
 * Error codes of `applyPatch`. The UI shows `validation.<code>` from the `shell` dictionary,
 * filling `{min}`, `{max}` and `{options}` from `params`; `message` is for agents and logs only.
 */
export const PATCH_ERROR_CODES = [
  "unknown-field",
  "read-only",
  "not-found",
  "required",
  "type",
  "integer",
  "min",
  "above",
  "max",
  "below",
  "too-long",
  "too-many",
  "choice",
  "format",
  "duplicate-id",
  "at-least-one-module",
  "invalid",
] as const

export type PatchErrorCode = (typeof PATCH_ERROR_CODES)[number]

export interface PatchError {
  /** The offending path: the patch key, or a path inside its value. */
  path: string
  code: PatchErrorCode
  params?: Record<string, number | string | readonly (number | string)[]>
  /** English detail for agents and logs. Never shown in the UI. */
  message: string
}

const CUSTOM_CODES: readonly PatchErrorCode[] = ["duplicate-id", "at-least-one-module"]

function custom(issue: z.core.$ZodIssueCustom): PatchErrorCode {
  const code = issue.params?.code
  return CUSTOM_CODES.includes(code) ? code : "invalid"
}

/** Maps one Zod issue (relative to the patched value) to a patch error. */
function fromIssue(base: string[], value: unknown, issue: z.core.$ZodIssue): PatchError[] {
  const segments = issue.path.map(String)
  const path = joinPath([...base, ...segments])
  const error = (code: PatchErrorCode, params?: PatchError["params"]): PatchError => ({
    path,
    code,
    ...(params && { params }),
    message: issue.message,
  })

  switch (issue.code) {
    case "invalid_type": {
      const input = segments.length === 0 ? value : getAt(value, segments)
      if (input === null || input === undefined) return [error("required")]
      return [error(issue.expected === "int" ? "integer" : "type", { expected: issue.expected })]
    }
    case "too_small": {
      if (issue.origin === "number" || issue.origin === "int") {
        return [error(issue.inclusive ? "min" : "above", { min: Number(issue.minimum) })]
      }
      return [error("invalid")]
    }
    case "too_big": {
      const max = Number(issue.maximum)
      if (issue.origin === "string") return [error("too-long", { max })]
      if (issue.origin === "array") return [error("too-many", { max })]
      return [error(issue.inclusive === false ? "below" : "max", { max })]
    }
    case "invalid_value":
      return [error("choice", { options: issue.values.map((option) => String(option)) })]
    case "invalid_format":
      return [error("format", { format: issue.format })]
    case "unrecognized_keys":
      return issue.keys.map((key) => ({
        path: joinPath([...base, ...segments, key]),
        code: "unknown-field" as const,
        message: issue.message,
      }))
    case "custom":
      return [error(custom(issue))]
    default:
      return [error("invalid")]
  }
}

/** Maps the issues of validating `value` at the path `base` to patch errors. */
export function toPatchErrors(base: string[], value: unknown, issues: readonly z.core.$ZodIssue[]): PatchError[] {
  return issues.flatMap((issue) => fromIssue(base, value, issue))
}

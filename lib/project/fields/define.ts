import type { Area } from "@/lib/i18n/dictionaries"
import type { NumberLimit } from "./limits"
import type { FieldTrace, TextRef } from "./types"

/** Trace metadata with empty defaults, so registry entries list only what applies. */
export function trace(partial: Partial<FieldTrace> = {}): FieldTrace {
  return {
    requirements: [],
    openQuestions: [],
    decisions: [],
    feeds: [],
    replaces: [],
    tables: [],
    ...partial,
  }
}

/** The dictionary node of a field or group: `fields.<id>` in its module's area. */
export function fieldText(area: Area, id: string): TextRef {
  return { area, key: `fields.${id}` }
}

/** The bounds of a limit as registry properties (the same numbers the schema uses). */
export function bounds(limit: NumberLimit): { min?: number; exclusiveMin?: number; max: number } {
  return {
    ...(limit.min !== undefined && { min: limit.min }),
    ...(limit.exclusiveMin !== undefined && { exclusiveMin: limit.exclusiveMin }),
    max: limit.max,
  }
}

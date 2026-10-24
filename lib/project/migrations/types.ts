/** A stored project as plain JSON, before it is validated. */
export type JsonObject = Record<string, unknown>

/** One step of the migration chain (D-13: old files are migrated on import). */
export interface Migration {
  /** The schema version this step produces; the input is `version - 1`. */
  version: number
  /** What changed, for the build log. */
  description: string
  /** Turns a project of `version - 1` into `version`. Pure; gets its own copy of the data. */
  up(project: JsonObject): JsonObject
}

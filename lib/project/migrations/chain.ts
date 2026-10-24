import type { Migration } from "./types"
import { v1Baseline } from "./v1-baseline"

/** The migration chain, oldest first: one step per schema version, ending at `SCHEMA_VERSION`. */
export const MIGRATIONS: readonly Migration[] = [v1Baseline]

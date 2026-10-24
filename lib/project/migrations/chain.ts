import type { Migration } from "./types"
import { v1Baseline } from "./v1-baseline"
import { v2Provenance } from "./v2-provenance"

/** The migration chain, oldest first: one step per schema version, ending at `SCHEMA_VERSION`. */
export const MIGRATIONS: readonly Migration[] = [v1Baseline, v2Provenance]

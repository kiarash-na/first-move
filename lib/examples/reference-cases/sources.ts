import type { Reference } from "@/lib/docs/references"

/**
 * External sources of the reference cases (D-76, D-78), in the format of `lib/docs/references.ts`:
 * every link opened and its content checked on the access date; `pnpm check:references` fetches
 * them again. Public docs may link outside the site only to these URLs and the method references.
 */
export const REFERENCE_CASE_SOURCES: readonly Reference[] = []

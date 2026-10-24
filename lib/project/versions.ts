/**
 * Versions written into every project and export file (D-13).
 *
 * - `SCHEMA_VERSION`: the shape of the stored project. Bump it with every breaking
 *   change to `lib/project/schema/` and add a step to `lib/project/migrations/`.
 * - `METHODOLOGY_VERSION`: the Quick Check methodology the results are computed with
 *   (equations, Tables 1–11 and the resolved OQ answers). Bump it when a result can
 *   change for the same inputs. Results are never stored, so a bump needs no migration.
 */
export const SCHEMA_VERSION = 2

export const METHODOLOGY_VERSION = "1.0.0"

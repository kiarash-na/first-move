/**
 * Names of everything First Move keeps in the browser (D-11). Project data never leaves it (D-14).
 * The theme preference has its own key in `lib/theme/theme.ts`.
 */

/** IndexedDB database: the primary store. */
export const DB_NAME = "first-move"

/** Bump with every store or index change and add an `upgrade` step in `idb.ts`. */
export const DB_VERSION = 1

/** Object stores of the database. */
export const STORE = {
  /** Latest state of each project, keyed by `meta.id` (raw JSON, validated on load). */
  projects: "projects",
  /** Up to `MAX_SNAPSHOTS` older states per project (auto-increment key, `projectId` index). */
  snapshots: "snapshots",
  /** Export bookkeeping per project, for the export reminder. */
  backups: "backups",
  /** File System Access handles of linked files (D-12). */
  fileLinks: "file-links",
} as const

/** localStorage: a copy of each project's latest state (`<prefix><project id>`). */
export const MIRROR_PREFIX = "first-move:mirror:"

/** sessionStorage: the project open in this tab (never in the URL, PLAN-DASH-00). */
export const ACTIVE_PROJECT_KEY = "first-move:active-project"

/** localStorage: the project used last in any tab ("Continue where you left off", D-03). */
export const LAST_PROJECT_KEY = "first-move:last-project"

/** BroadcastChannel between tabs of the same browser. */
export const TAB_CHANNEL = "first-move:storage"

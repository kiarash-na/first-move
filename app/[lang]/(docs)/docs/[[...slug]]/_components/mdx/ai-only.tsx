import type * as React from "react"

/**
 * Content about the AI features, shown only while they are live (`AI_FEATURES_LIVE`), so a page
 * never links to the AI pages while those answer 404. The knowledge index keeps the text, as the
 * agents run only after go-live.
 */
export function AiOnly({ live, children }: { live: boolean; children?: React.ReactNode }) {
  return live ? <>{children}</> : null
}

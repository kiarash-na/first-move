"use client"

import { useDictionary } from "./i18n-provider"
import { PageSkeleton } from "./page-skeleton"

/**
 * The project gate's loading skeleton with its localized label. Also the `<Suspense>` fallback
 * of the step pages, so the App Shell looks like the gate before the store is ready.
 */
export function GateSkeleton() {
  return <PageSkeleton label={useDictionary("shell").loading} />
}

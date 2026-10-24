"use client"

import type { ExampleCard } from "@/lib/dashboard/example-cards"
import { useDictionary } from "../_components/i18n-provider"
import { PageHeader } from "../_components/page-header"
import { ContinueCard } from "./continue-card"
import { ExamplesGallery } from "./examples-gallery"
import { ImportDropZone } from "./import-drop-zone"
import { PathTiles } from "./path-tiles"
import { ProjectList } from "./project-list"
import { StorageBanner } from "./storage-banner"

/**
 * The start screen at every visit (D-03): continue where you left off, import, the storage
 * warning, path tiles, examples and the project list. Static parts render at once; parts that
 * need stored data show skeletons until the store is ready.
 */
export function StartScreen({ examples }: { examples: readonly ExampleCard[] }) {
  const start = useDictionary("start")

  return (
    <div className="flex flex-col gap-12 sm:gap-14">
      <PageHeader eyebrow={start.header.eyebrow} title={start.header.title} description={start.header.body} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <ContinueCard />
        <ImportDropZone />
      </div>
      {/* Below the Continue/Import row: it appears only once the store is ready, so above it would push the first screen down (layout shift). */}
      <StorageBanner />
      <PathTiles />
      <ExamplesGallery examples={examples} />
      <ProjectList />
    </div>
  )
}

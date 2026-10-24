"use client"

import { useState } from "react"

import { START_PATHS, type StartPath } from "@/lib/dashboard/start-paths"
import { useDictionary } from "../_components/i18n-provider"
import { NewProjectDialog } from "./new-project-dialog"
import { PathTile } from "./path-tile"
import { SectionHeading } from "./section-heading"

/** "Start a new project": the three path tiles and the name dialog (D-03). */
export function PathTiles() {
  const start = useDictionary("start")
  const [path, setPath] = useState<StartPath | null>(null)

  return (
    <section aria-labelledby="paths-title" className="flex flex-col gap-5">
      <SectionHeading id="paths-title" title={start.paths.title} body={start.paths.body} />
      <div className="grid gap-4 md:grid-cols-3">
        {START_PATHS.map((entry) => (
          <PathTile key={entry} path={entry} onSelect={setPath} />
        ))}
      </div>
      <NewProjectDialog path={path} onOpenChange={(open) => !open && setPath(null)} />
    </section>
  )
}

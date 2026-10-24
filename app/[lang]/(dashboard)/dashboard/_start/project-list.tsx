"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { useState } from "react"
import { useDictionary, useLocale } from "../_components/i18n-provider"
import { DeleteProjectDialog } from "../_components/project-actions/delete-project-dialog"
import { useProjectActions } from "../_components/project-actions/use-project-actions"
import { useStoreState } from "../_components/store-provider"
import { ProjectRow } from "./project-row"
import { SectionHeading } from "./section-heading"

/** All projects in this browser, most recently changed first (D-02): open, duplicate, delete. */
export function ProjectList() {
  const lang = useLocale()
  const start = useDictionary("start")
  const shell = useDictionary("shell")
  const phase = useStoreState((state) => state.phase)
  const projects = useStoreState((state) => state.projects)
  const activeId = useStoreState((state) => state.activeId)
  const { open, duplicate } = useProjectActions()
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null)
  const copy = start.projects

  return (
    <section aria-labelledby="projects-title" className="flex flex-col gap-5">
      <SectionHeading
        id="projects-title"
        title={copy.title}
        aside={
          phase === "ready" && projects.length > 0 ? (
            <span className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">
              {interpolate(copy.count, { count: formatNumber(projects.length, lang) })}
            </span>
          ) : null
        }
      />
      {phase !== "ready" ? (
        <div className="flex flex-col divide-y border" aria-busy="true" aria-label={shell.loading}>
          {[0, 1].map((key) => (
            <div key={key} className="flex items-center justify-between gap-4 px-5 py-5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-11 w-24" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <p className="border px-5 py-6 text-base text-muted-foreground">{copy.empty}</p>
      ) : (
        <ul className="flex flex-col divide-y border">
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              current={project.id === activeId}
              onOpen={() => void open(project.id)}
              onDuplicate={() => void duplicate(project.id, project.name)}
              onDelete={() => setDeleting({ id: project.id, name: project.name })}
            />
          ))}
        </ul>
      )}
      <DeleteProjectDialog project={deleting} onOpenChange={(isOpen) => !isOpen && setDeleting(null)} />
    </section>
  )
}

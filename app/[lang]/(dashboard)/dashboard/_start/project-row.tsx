"use client"

import { CopyIcon, FlaskConicalIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatChangeTime } from "@/lib/dashboard/change-time"
import { interpolate } from "@/lib/i18n/interpolate"
import type { ProjectSummary } from "@/lib/store"
import { useDictionary, useLocale } from "../_components/i18n-provider"
import { ModuleBadges } from "../_components/module-badges"

/** One stored project: name, modules, last change, and Open / Duplicate / Delete. */
export function ProjectRow({
  project,
  current,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  project: ProjectSummary
  current: boolean
  onOpen: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const lang = useLocale()
  const start = useDictionary("start")
  const shell = useDictionary("shell")
  const copy = start.projects
  const name = project.name || shell.fields.meta.name.placeholder

  return (
    <li className="grid grid-cols-1 items-center gap-x-4 gap-y-3 px-5 py-4 transition-colors hover:bg-accent/40 sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <span className="min-w-0 text-base font-[520] break-words sm:truncate">{name}</span>
          {current && <span className="shrink-0 font-mono text-xs tracking-[0.06em] text-primary uppercase">· {copy.current}</span>}
        </span>
        <span className="flex flex-wrap items-center gap-2">
          <ModuleBadges modules={project.modules} />
          {project.exampleId && (
            <span className="inline-flex items-center gap-1 font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">
              <FlaskConicalIcon className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
              {shell.nav.example}
            </span>
          )}
        </span>
      </div>
      <span className="font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">
        {interpolate(copy.updated, { time: formatChangeTime(project.updatedAt, lang) })}
      </span>
      <div role="group" aria-label={interpolate(copy.actions, { name })} className="flex items-center gap-1">
        <Button variant="secondary" onClick={onOpen}>
          {copy.open}
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={copy.duplicate} onClick={onDuplicate}>
              <CopyIcon strokeWidth={1.6} aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copy.duplicate}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={copy.delete} onClick={onDelete} className="hover:text-hot">
              <Trash2Icon strokeWidth={1.6} aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copy.delete}</TooltipContent>
        </Tooltip>
      </div>
    </li>
  )
}

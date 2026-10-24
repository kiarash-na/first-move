"use client"

import { FlaskConicalIcon, FolderIcon, FolderOpenIcon } from "lucide-react"
import { useRef } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary } from "../i18n-provider"
import { ModuleBadges } from "../module-badges"
import { useStoreState } from "../store-provider"
import { useRail } from "./rail"
import { RailReveal } from "./rail-reveal"

/**
 * The open project at the top of the sidebar: name, modules, example tag. Skeleton until loaded.
 * In the collapsed rail (D-59) it is an icon button with the project name in its tooltip, which
 * expands the sidebar and moves focus to these details.
 */
export function SidebarProject() {
  const shell = useDictionary("shell")
  const phase = useStoreState((state) => state.phase)
  const active = useStoreState((state) => state.active)
  const rail = useRail()
  const details = useRef<HTMLDivElement>(null)
  const name = active ? active.meta.name || shell.fields.meta.name.placeholder : null

  return (
    <>
      <div
        ref={details}
        data-slot="sidebar-project"
        tabIndex={rail ? -1 : undefined}
        className="flex min-h-[10.65rem] flex-col gap-2 border-b px-5 py-5 outline-offset-[-2px] rail:hidden"
      >
        <p className="font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">{shell.nav.currentProject}</p>
        {phase !== "ready" ? (
          <div className="flex flex-col gap-2" aria-busy="true" aria-label={shell.loading}>
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : active ? (
          <>
            <p className="line-clamp-2 text-lg leading-snug font-[560] tracking-[-0.025em] [font-stretch:88%]">{name}</p>
            <ModuleBadges modules={active.meta.modules} />
            {active.meta.exampleId && (
              <span className="inline-flex items-center gap-1 font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">
                <FlaskConicalIcon className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
                {shell.nav.example}
              </span>
            )}
          </>
        ) : (
          <>
            <p className="text-lg leading-snug font-[560] tracking-[-0.025em] text-text-secondary [font-stretch:88%]">
              {shell.nav.noProject}
            </p>
            <p className="text-sm leading-normal text-muted-foreground">{shell.nav.noProjectHint}</p>
          </>
        )}
      </div>
      <RailReveal
        className="border-b py-2.5"
        icon={name === null ? FolderIcon : FolderOpenIcon}
        label={name === null ? shell.nav.noProject : interpolate(shell.nav.rail.project, { name })}
        tooltip={name ?? shell.nav.noProject}
        loading={phase !== "ready"}
        target={details}
      />
    </>
  )
}

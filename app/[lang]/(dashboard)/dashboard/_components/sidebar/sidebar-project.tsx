"use client"

import { FlaskConicalIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { useDictionary } from "../i18n-provider"
import { ModuleBadges } from "../module-badges"
import { useStoreState } from "../store-provider"

/** The open project at the top of the sidebar: name, modules, example tag. Skeleton until loaded. */
export function SidebarProject() {
  const shell = useDictionary("shell")
  const phase = useStoreState((state) => state.phase)
  const active = useStoreState((state) => state.active)

  return (
    <div data-slot="sidebar-project" className="flex flex-col gap-2 border-b px-5 py-5">
      <p className="font-mono text-xs tracking-[0.075em] text-muted-foreground uppercase">{shell.nav.currentProject}</p>
      {phase !== "ready" ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label={shell.loading}>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-28" />
        </div>
      ) : active ? (
        <>
          <p className="line-clamp-2 text-lg leading-snug font-[560] tracking-[-0.025em] [font-stretch:88%]">
            {active.meta.name || shell.fields.meta.name.placeholder}
          </p>
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
  )
}

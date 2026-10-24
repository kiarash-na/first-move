"use client"

import { ArrowRightIcon, FlaskConicalIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatChangeTime } from "@/lib/dashboard/change-time"
import { interpolate } from "@/lib/i18n/interpolate"
import type { ProjectStoreState } from "@/lib/store"
import { useDictionary, useLocale } from "../_components/i18n-provider"
import { ModuleBadges } from "../_components/module-badges"
import { useProjectActions } from "../_components/project-actions/use-project-actions"
import { useStoreState } from "../_components/store-provider"
import { NetworkMark } from "./network-mark"

const lastUsed = (state: ProjectStoreState) => state.projects.find((entry) => entry.id === state.lastUsedId) ?? null

/**
 * "Continue where you left off" (D-03): the last used project, large, with its last change and
 * one button that reopens it at the overview. A welcome note when there is nothing to continue.
 */
export function ContinueCard() {
  const lang = useLocale()
  const start = useDictionary("start")
  const shell = useDictionary("shell")
  const phase = useStoreState((state) => state.phase)
  const project = useStoreState(lastUsed)
  const { open } = useProjectActions()
  const [busy, setBusy] = useState(false)
  const copy = start.continue

  return (
    <section
      aria-labelledby="continue-title"
      className="relative flex min-h-72 flex-col lg:min-h-[21.5rem] justify-between gap-8 overflow-hidden border bg-card p-[clamp(22px,3vw,40px)] before:absolute before:inset-x-0 before:-top-px before:h-0.5 before:bg-primary"
    >
      <NetworkMark className="absolute -right-6 -bottom-6 w-[min(300px,55%)] opacity-60 max-sm:hidden" />
      <div className="relative flex max-w-[44ch] flex-col gap-3">
        <p className="font-mono text-xs tracking-[0.075em] text-primary uppercase">{copy.eyebrow}</p>
        {phase !== "ready" ? (
          <div className="flex flex-col gap-3" aria-busy="true" aria-label={shell.loading}>
            <Skeleton className="h-10 w-[min(22rem,90%)]" />
            <Skeleton className="h-5 w-48" />
          </div>
        ) : project ? (
          <>
            <h2 id="continue-title" className="text-[clamp(28px,3.2vw,40px)] leading-[1.05] font-[580] tracking-[-0.045em] text-balance [font-stretch:82%]">
              {project.name || shell.fields.meta.name.placeholder}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <ModuleBadges modules={project.modules} />
              {project.exampleId && (
                <span className="inline-flex items-center gap-1 font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">
                  <FlaskConicalIcon className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
                  {shell.nav.example}
                </span>
              )}
              <span className="font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">
                {interpolate(copy.updated, { time: formatChangeTime(project.updatedAt, lang) })}
              </span>
            </div>
          </>
        ) : (
          <>
            <h2 id="continue-title" className="text-[clamp(28px,3.2vw,40px)] leading-[1.05] font-[580] tracking-[-0.045em] [font-stretch:82%]">
              {copy.welcomeTitle}
            </h2>
            <p className="text-base leading-relaxed text-text-secondary">{copy.welcomeBody}</p>
          </>
        )}
      </div>
      {phase !== "ready" && (
        // Holds the button's place so the card does not grow when the last project loads.
        <Skeleton data-slot="continue-action-skeleton" className="relative h-14 w-48 sm:h-15" />
      )}
      {phase === "ready" && project && (
        <div className="relative">
          <Button
            size="lg"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              if (!(await open(project.id))) setBusy(false)
            }}
          >
            {copy.action}
            <ArrowRightIcon strokeWidth={1.6} aria-hidden="true" />
          </Button>
        </div>
      )}
    </section>
  )
}

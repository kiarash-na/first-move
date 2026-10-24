"use client"

import { FolderOpenIcon, PowerIcon } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { dashboardHref } from "@/lib/dashboard/routes"
import { interpolate } from "@/lib/i18n/interpolate"
import type { ProjectModules } from "@/lib/project"
import { EmptyState } from "./empty-state"
import { useDictionary, useLocale } from "./i18n-provider"
import { PageSkeleton } from "./page-skeleton"
import { useStore, useStoreState } from "./store-provider"

/**
 * Wraps every project page: a skeleton until the store is ready, a way back to the start
 * screen when no project is open, and a switch when the page's module is off (D-01).
 */
export function ProjectGate({ module, children }: { module?: keyof ProjectModules; children: ReactNode }) {
  const lang = useLocale()
  const shell = useDictionary("shell")
  const store = useStore()
  const phase = useStoreState((state) => state.phase)
  const active = useStoreState((state) => state.active)

  if (phase !== "ready") return <PageSkeleton label={shell.loading} />

  if (!active) {
    return (
      <EmptyState
        icon={FolderOpenIcon}
        title={shell.gate.noProject.title}
        body={shell.gate.noProject.body}
        action={
          <Button asChild>
            <Link href={dashboardHref(lang)}>{shell.gate.noProject.action}</Link>
          </Button>
        }
      />
    )
  }

  if (module && !active.meta.modules[module]) {
    const name = shell.fields.meta.modules[module].label
    const tone = module === "quickCheck" ? "cool" : "hot"
    return (
      <EmptyState
        icon={PowerIcon}
        tone={tone}
        title={interpolate(shell.gate.moduleOff.title, { module: name })}
        body={shell.gate.moduleOff.body}
        action={
          <Button variant={tone === "cool" ? "default" : "hot"} onClick={() => store.patch({ [`meta.modules.${module}`]: true })}>
            {interpolate(shell.gate.moduleOff.action, { module: name })}
          </Button>
        }
      />
    )
  }

  return children
}

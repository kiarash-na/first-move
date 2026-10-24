"use client"

import { BriefcaseBusinessIcon, GaugeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ProjectModules } from "@/lib/project"
import { EmptyState } from "../../_components/empty-state"
import { useDictionary } from "../../_components/i18n-provider"
import { useStore } from "../../_components/store-provider"

/**
 * Offers the module a project does not have yet (D-01: the two modules are optional): "Add Business
 * Plan" on a Quick Check project and the other way round. Turning it on goes through `store.patch`.
 */
export function AddModuleCard({ module }: { module: keyof ProjectModules }) {
  const store = useStore()
  const copy = useDictionary("overview").add[module]
  const cool = module === "quickCheck"

  return (
    <EmptyState
      icon={cool ? GaugeIcon : BriefcaseBusinessIcon}
      tone={cool ? "cool" : "hot"}
      title={copy.title}
      body={copy.body}
      action={
        <Button variant={cool ? "default" : "hot"} onClick={() => store.patch({ [`meta.modules.${module}`]: true })}>
          {copy.action}
        </Button>
      }
    />
  )
}

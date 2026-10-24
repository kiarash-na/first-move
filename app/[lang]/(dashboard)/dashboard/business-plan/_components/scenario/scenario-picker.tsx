"use client"

import { useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { presetOverwrites, presetPatch } from "@/lib/business-plan"
import { interpolate } from "@/lib/i18n/interpolate"
import { SCENARIO_IDS, type ProjectPatch, type ScenarioId } from "@/lib/project"
import { useDictionary } from "../../../_components/i18n-provider"
import { useStore, useStoreState } from "../../../_components/store-provider"
import { SectionPanel } from "../section-panel"
import { ScenarioCard } from "./scenario-card"

interface Pending {
  id: ScenarioId
  patch: ProjectPatch
  fields: string[]
}

/**
 * Picks the use case (BM-SCOPE-05/06, OQ-25): a provided scenario prefills only the site fields
 * it states, a custom use case prefills nothing. Replacing text the team already wrote asks
 * first (D-02).
 */
export function ScenarioPicker({ index }: { index?: number }) {
  const bp = useDictionary("business-plan")
  const store = useStore()
  const project = useStoreState((state) => state.active)
  const selected = project?.businessPlan.scenarioId ?? null
  const [pending, setPending] = useState<Pending | null>(null)

  function apply(id: ScenarioId, patch: ProjectPatch) {
    const result = store.patch(patch)
    if (result?.ok) toast.success(interpolate(bp.scenario.applied, { name: bp.scenarios[id].label }))
    setPending(null)
  }

  function choose(id: ScenarioId) {
    if (!project) return
    const patch = presetPatch(id, bp.presets)
    const fields = presetOverwrites(project, patch)
    if (fields.length > 0) setPending({ id, patch, fields })
    else apply(id, patch)
  }

  return (
    <SectionPanel id="scenario" index={index} title={bp.scenario.title} help={bp.scenario.lead}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SCENARIO_IDS.map((id) => (
          <ScenarioCard key={id} id={id} selected={selected === id} onChoose={() => choose(id)} />
        ))}
      </div>
      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{bp.scenario.overwrite.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {interpolate(bp.scenario.overwrite.body, {
                fields: (pending?.fields ?? [])
                  .map((field) => bp.fields.site[field as keyof typeof bp.fields.site] as { label: string })
                  .map((node) => node.label)
                  .join(", "),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{bp.scenario.overwrite.keep}</AlertDialogCancel>
            <AlertDialogAction onClick={() => pending && apply(pending.id, pending.patch)}>
              {bp.scenario.overwrite.replace}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SectionPanel>
  )
}

"use client"

import { CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useDictionary } from "../../_components/i18n-provider"
import { useProjectActions } from "../../_components/project-actions/use-project-actions"
import { useStoreState } from "../../_components/store-provider"

/**
 * Compare business models by duplicating the project (D-29): a project holds one model, the
 * copy is changed and the two are compared side by side.
 */
export function CompareModels() {
  const bp = useDictionary("business-plan")
  const actions = useProjectActions()
  const project = useStoreState((state) => state.active?.meta ?? null)
  if (!project) return null

  return (
    <aside className="flex flex-col gap-4 border border-dashed p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8" data-slot="compare-models">
      <div className="flex max-w-[62ch] flex-col gap-1">
        <h3 className="font-mono text-xs tracking-[0.075em] text-hot uppercase">{bp.compare.title}</h3>
        <p className="text-sm leading-relaxed text-text-secondary">{bp.compare.body}</p>
      </div>
      <Button type="button" variant="secondary" className="shrink-0" onClick={() => void actions.duplicate(project.id, project.name)}>
        <CopyIcon strokeWidth={1.6} aria-hidden="true" />
        {bp.compare.action}
      </Button>
    </aside>
  )
}

"use client"

import { useState } from "react"
import { clearPatch, fieldsOf, groupsOf } from "@/lib/project"
import { shareSum, SHARE_GROUP } from "@/lib/dashboard/share-sum"
import { useFieldPatch } from "../../../../_components/fields/use-field-patch"
import { useStoreState } from "../../../../_components/store-provider"
import { ClearSharesDialog } from "./clear-shares-dialog"
import { ShareGrid } from "./share-grid"
import { ShareSumBar } from "./share-sum-bar"

const GROUP = groupsOf({ module: "quickCheck", step: "buildings" }).find((group) => group.id === SHARE_GROUP)!
const RESET = clearPatch(fieldsOf({ group: SHARE_GROUP }))

/** Step 2, buildings: the 5×5 share grid with its live sum (QCT-IN-04, R-03, D-31). Clearing asks first (D-02). */
export function BuildingsStep() {
  const project = useStoreState((state) => state.active)
  const patch = useFieldPatch()
  const [confirming, setConfirming] = useState(false)
  if (!project) return null
  const sum = shareSum(project)
  return (
    <div data-slot="buildings-step" className="flex flex-col gap-4">
      <ShareGrid group={GROUP} sum={sum} />
      <ShareSumBar sum={sum} onClear={() => setConfirming(true)} />
      <ClearSharesDialog
        open={confirming}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false)
          patch(RESET)
        }}
      />
    </div>
  )
}

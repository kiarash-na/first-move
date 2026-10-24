"use client"

import { CircleDashedIcon } from "lucide-react"

import type { QuickCheckIncomplete as Incomplete } from "@/lib/quick-check"
import { EmptyState } from "../../_components/empty-state"
import { useDictionary } from "../../_components/i18n-provider"
import { MissingSteps } from "../../_components/missing-steps"

/** The Quick Check is on but cannot give a result yet (R-03): say so and link the open steps. */
export function QuickCheckIncomplete({ result }: { result: Incomplete }) {
  const copy = useDictionary("overview").incomplete
  return (
    <EmptyState
      icon={CircleDashedIcon}
      tone="cool"
      title={copy.title}
      body={copy.body}
      action={<MissingSteps steps={result.incompleteSteps} className="w-full max-w-md" />}
    />
  )
}

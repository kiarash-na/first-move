"use client"

import { PencilLineIcon, SigmaIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { QuickCheckFlags } from "@/lib/quick-check"
import { useDictionary } from "../i18n-provider"

/** Says whether the network length was entered or estimated (QCT-KF-07). */
export function NetworkLengthTag({ flags, withHint = false }: { flags: QuickCheckFlags; withHint?: boolean }) {
  const ui = useDictionary("quick-check").ui.results.network
  const manual = flags.manualNetworkLength
  const Icon = manual ? PencilLineIcon : SigmaIcon
  return (
    <span data-slot="network-length-tag" data-source={manual ? "manual" : "estimated"} className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1">
      <Badge variant={manual ? "default" : "secondary"}>
        <Icon strokeWidth={1.8} aria-hidden="true" />
        {manual ? ui.manual : ui.estimated}
      </Badge>
      {withHint && <span className="text-sm leading-snug text-muted-foreground">{manual ? ui.manualHint : ui.estimatedHint}</span>}
    </span>
  )
}

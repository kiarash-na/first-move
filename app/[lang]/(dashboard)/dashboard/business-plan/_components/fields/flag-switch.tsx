"use client"

import { FlagIcon } from "lucide-react"
import { useId } from "react"

import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useDictionary } from "../../../_components/i18n-provider"

/** A row's flag property (the potential deal-breaker) as an orange switch with its hint. */
export function FlagSwitch({ label, on, onChange }: { label: string; on: boolean; onChange: (value: boolean) => void }) {
  const id = useId()
  const bp = useDictionary("business-plan")

  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-4", on && "text-hot")}>
      <Switch
        id={id}
        checked={on}
        onCheckedChange={onChange}
        aria-describedby={`${id}-hint`}
        className="data-[state=checked]:border-hot data-[state=checked]:bg-hot"
      />
      <label htmlFor={id} className="flex cursor-pointer items-center gap-2 font-mono text-xs tracking-[0.06em] uppercase">
        <FlagIcon className="size-4" strokeWidth={1.6} aria-hidden="true" />
        {label}
      </label>
      {on && <span className="font-mono text-xs tracking-[0.06em] uppercase">{bp.ui.dealBreaker.marked}</span>}
      <p id={`${id}-hint`} className="basis-full text-sm leading-snug text-muted-foreground">
        {bp.ui.dealBreaker.hint}
      </p>
    </div>
  )
}

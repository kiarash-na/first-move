"use client"

import { RotateCcwIcon, SlidersHorizontalIcon } from "lucide-react"
import { useId } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { formatNumber } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { cn } from "@/lib/utils"
import { CustomParametersBadge } from "../../_components/custom-parameters-badge"
import { useDictionary, useLocale } from "../../_components/i18n-provider"

/**
 * "Play with parameters" (D-10): the switch that makes TBL-4/5/6 editable, how many custom
 * values are in use (with the "Custom parameters" badge) and the one-click reset.
 */
export function PlaygroundBar({
  playing,
  customCount,
  onToggle,
  onReset,
}: {
  playing: boolean
  customCount: number
  onToggle: (next: boolean) => void
  onReset: () => void
}) {
  const lang = useLocale()
  const copy = useDictionary("assumptions").playground
  const id = useId()
  return (
    <section
      aria-labelledby={`${id}-title`}
      data-slot="playground"
      data-playing={playing}
      className={cn(
        "relative flex flex-col gap-5 border bg-card p-[clamp(20px,3vw,32px)] before:absolute before:inset-x-0 before:-top-px before:h-0.5",
        playing ? "before:bg-hot" : "before:bg-transparent",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
        <div className="flex max-w-[62ch] flex-col gap-1.5">
          <h2 id={`${id}-title`} className="inline-flex items-center gap-2 text-xl leading-tight font-[560] tracking-[-0.035em] [font-stretch:86%]">
            <SlidersHorizontalIcon className={cn("size-5", playing ? "text-hot" : "text-muted-foreground")} strokeWidth={1.6} aria-hidden="true" />
            {copy.title}
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">{copy.body}</p>
        </div>
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className={cn("font-mono text-xs tracking-[0.06em] uppercase", playing ? "text-hot" : "text-muted-foreground")}>
            {playing ? copy.on : copy.off}
          </span>
          <Switch
            checked={playing}
            onCheckedChange={onToggle}
            aria-label={copy.toggle}
            className="data-[state=checked]:border-hot data-[state=checked]:bg-hot"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p aria-live="polite" className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <CustomParametersBadge linked={false} />
          {customCount > 0 ? interpolate(copy.count, { count: formatNumber(customCount, lang) }) : copy.none}
        </p>
        <Button variant="secondary" onClick={onReset} disabled={customCount === 0}>
          <RotateCcwIcon strokeWidth={1.6} aria-hidden="true" />
          {copy.reset}
        </Button>
      </div>
    </section>
  )
}

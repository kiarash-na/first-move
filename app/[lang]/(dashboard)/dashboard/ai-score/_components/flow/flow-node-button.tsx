"use client"

import { useId, type ReactNode } from "react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { LEVEL_RAMP_CLASS } from "./level-ramp"

/**
 * A focusable node of the decision flow: the node itself is the trigger (44px or taller) and its
 * detail opens in a popover (a labelled dialog; Escape closes it and returns focus). `nodeKey`
 * lets the edges find the node.
 */
export function FlowNodeButton({
  nodeKey,
  kind,
  title,
  trigger,
  children,
  data,
  className,
}: {
  nodeKey: string
  /** The kind in the detail's eyebrow ("Check"). */
  kind: string
  title: string
  trigger: ReactNode
  children: ReactNode
  data?: Record<string, string | number | boolean | undefined>
  className?: string
}) {
  const titleId = useId()
  const attributes = Object.fromEntries(Object.entries(data ?? {}).map(([key, value]) => [`data-${key}`, value === undefined ? undefined : String(value)]))

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-flow-node={nodeKey}
          {...attributes}
          className={cn(
            "group/node flex min-h-11 w-full min-w-0 cursor-pointer items-stretch border bg-card text-left transition-colors duration-[180ms] hover:border-foreground/45 data-[state=open]:border-hot",
            "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300",
            className,
          )}
        >
          {trigger}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" aria-labelledby={titleId} className={cn("flex w-80 flex-col gap-3", LEVEL_RAMP_CLASS)}>
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs tracking-[0.06em] text-hot uppercase">{kind}</p>
          <h4 id={titleId} className="text-base leading-snug font-[560] tracking-[-0.01em]">
            {title}
          </h4>
        </div>
        <div className="flex flex-col gap-3 text-sm leading-relaxed">{children}</div>
      </PopoverContent>
    </Popover>
  )
}

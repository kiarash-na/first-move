"use client"

import { BotIcon } from "lucide-react"
import dynamic from "next/dynamic"
import { useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { useDictionary } from "../_components/i18n-provider"
import { LAUNCHER_GAP, useNoticeClearance } from "./use-notice-clearance"

/** The panel and the AI SDK load on the first click only, in their own chunk (D-60). */
const AssistantPanel = dynamic(() => import("./panel/assistant-panel").then((module) => module.AssistantPanel), { ssr: false })

/**
 * The AI assistant's button (O7, PLAN-AGENT-05 step 8): a 48px square with the Bot icon, fixed
 * bottom right on every dashboard page. `DashboardShell` renders it only while
 * `AI_FEATURES_LIVE` is true. Once opened, the panel stays mounted (hidden when closed), so the
 * conversation survives closing it.
 */
export function AgentLauncher() {
  const copy = useDictionary("assistant").launcher
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const lift = useNoticeClearance()

  function close() {
    setOpen(false)
    button.current?.focus()
  }

  return (
    <>
      <button
        ref={button}
        type="button"
        data-slot="agent-launcher"
        aria-label={open ? copy.close : copy.open}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          setLoaded(true)
          setOpen((value) => !value)
        }}
        style={{ bottom: `max(${LAUNCHER_GAP + lift}px, calc(env(safe-area-inset-bottom) + ${LAUNCHER_GAP}px))` }}
        className={cn(
          "fixed right-[max(1rem,env(safe-area-inset-right))] z-40 flex size-12 cursor-pointer items-center justify-center border border-control-border bg-card text-foreground shadow-panel transition-[translate,border-color,color] duration-[170ms] ease-out hover:-translate-y-0.5 hover:border-foreground/45 print:hidden",
          open && "border-primary text-primary",
        )}
      >
        <BotIcon className="size-6" strokeWidth={1.6} aria-hidden="true" />
      </button>
      {loaded && <AssistantPanel open={open} onClose={close} />}
    </>
  )
}

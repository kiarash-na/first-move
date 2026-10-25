"use client"

import { BotIcon } from "lucide-react"
import { useRef, useState, type ComponentType } from "react"

import { cn } from "@/lib/utils"
import { useDictionary } from "../_components/i18n-provider"
import { PanelStatus } from "./panel-status"
import { LAUNCHER_GAP, LAUNCHER_SIZE, useNoticeClearance } from "./use-notice-clearance"

type Panel = ComponentType<{ open: boolean; onClose: () => void }>
type Load = { state: "idle" | "loading" | "failed" } | { state: "ready"; Panel: Panel }

/** The panel and the AI SDK load on the first click only, in their own chunk (D-60). */
const loadPanel = (): Promise<Panel> => import("./panel/assistant-panel").then((module) => module.AssistantPanel)

/**
 * The AI assistant's button (O7, PLAN-AGENT-05 step 8): a 48px square with the Bot icon, fixed
 * bottom right on every dashboard page. `DashboardShell` renders it only while
 * `AI_FEATURES_LIVE` is true. Once opened, the panel stays mounted (hidden when closed), so the
 * conversation survives closing it. While the panel's chunk loads, a note above the button says
 * so; if it cannot load (offline), the note says that, and the next click tries again.
 */
export function AgentLauncher() {
  const copy = useDictionary("assistant").launcher
  const [load, setLoad] = useState<Load>({ state: "idle" })
  const [open, setOpen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const lift = useNoticeClearance()
  const bottom = (extra: number) => `max(${LAUNCHER_GAP + lift + extra}px, calc(env(safe-area-inset-bottom) + ${LAUNCHER_GAP + extra}px))`

  function toggle() {
    if (load.state === "idle" || load.state === "failed") {
      setLoad({ state: "loading" })
      setOpen(true)
      loadPanel().then(
        (Panel) => setLoad({ state: "ready", Panel }),
        () => {
          setLoad({ state: "failed" })
          setOpen(false)
        },
      )
      return
    }
    setOpen((value) => !value)
  }

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
        // The open panel covers the button (on phones the whole page), so Tab skips it meanwhile.
        tabIndex={open && load.state === "ready" ? -1 : undefined}
        onClick={toggle}
        style={{ bottom: bottom(0) }}
        className={cn(
          "fixed right-[max(1rem,env(safe-area-inset-right))] z-40 flex size-12 cursor-pointer items-center justify-center border border-control-border bg-card text-foreground shadow-panel transition-[translate,border-color,color] duration-[170ms] ease-out hover:-translate-y-0.5 hover:border-foreground/45 print:hidden",
          open && "border-primary text-primary",
        )}
      >
        <BotIcon className="size-6" strokeWidth={1.6} aria-hidden="true" />
      </button>
      {((open && load.state === "loading") || load.state === "failed") && <PanelStatus failed={load.state === "failed"} bottom={bottom(LAUNCHER_SIZE + 8)} />}
      {load.state === "ready" && <load.Panel open={open} onClose={close} />}
    </>
  )
}

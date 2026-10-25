"use client"

import type { ReactNode } from "react"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AI_FEATURES_LIVE } from "@/lib/legal/ai"
import { useStartProjectStore } from "@/lib/store"
import { AgentLauncher } from "../_agent/agent-launcher"
import { useDictionary } from "./i18n-provider"
import { ImportProvider } from "./import/import-provider"
import { NoticeToasts } from "./notices/notice-toasts"
import { Sidebar } from "./sidebar/sidebar"
import { SkipLink } from "./skip-link"
import { useStore } from "./store-provider"
import { TopBar } from "./top-bar/top-bar"

/** Toasts sit above the assistant's 48px launcher (16px gap + 48px + 12px) while it is shown. */
const ABOVE_LAUNCHER = { offset: { bottom: 76 }, mobileOffset: { bottom: 76 } }

/**
 * The dashboard frame (PLAN-DASH-07): sidebar, top bar, toasts, and the AI assistant's launcher
 * while `AI_FEATURES_LIVE` is on (the one touch point of PLAN-AGENT-00 here). Starts the project store once
 * (after mount; the static shell and hydration see the empty server snapshot, so every data
 * part shows a skeleton first).
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const store = useStore()
  const shell = useDictionary("shell")
  useStartProjectStore(store)

  return (
    <TooltipProvider>
      <ImportProvider>
        {/* On paper only the page content prints (the report, D-70): the frame and toasts stay on screen. */}
        <div className="contents print:hidden">
          <SkipLink />
        </div>
        <div className="flex min-h-dvh print:block print:min-h-0">
          <Sidebar className="print:hidden" />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="contents print:hidden">
              <TopBar />
            </div>
            <main id="main" tabIndex={-1} className="mx-auto outline-none w-full max-w-content flex-1 px-[clamp(16px,3.2vw,52px)] pt-8 pb-16 sm:pt-10 print:max-w-none print:p-0">
              {children}
            </main>
          </div>
        </div>
        <NoticeToasts />
        <div className="contents print:hidden">
          <Toaster
            position="bottom-right"
            closeButton
            containerAriaLabel={shell.notices.region}
            toastOptions={{ closeButtonAriaLabel: shell.notices.dismiss }}
            {...(AI_FEATURES_LIVE ? ABOVE_LAUNCHER : {})}
          />
        </div>
        {AI_FEATURES_LIVE && <AgentLauncher />}
      </ImportProvider>
    </TooltipProvider>
  )
}

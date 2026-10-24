"use client"

import { ShieldCheckIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Brand } from "@/components/brand/brand"
import { useDictionary, useLocale } from "../i18n-provider"
import { SidebarNav } from "./sidebar-nav"
import { SidebarProject } from "./sidebar-project"

/** What the sidebar holds, on desktop and in the mobile sheet: brand, open project, navigation, privacy note. */
export function SidebarContent({ onNavigate, footer }: { onNavigate?: () => void; footer?: ReactNode }) {
  const lang = useLocale()
  const common = useDictionary("common")
  const shell = useDictionary("shell")

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-16 shrink-0 items-center border-b px-5">
        <Brand href={`/${lang}`} name={common.app.name} label={common.app.homeLabel} />
      </div>
      <SidebarProject />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <SidebarNav onNavigate={onNavigate} />
      </div>
      {footer}
      <p className="flex shrink-0 items-start gap-2.5 border-t px-5 py-4 text-xs leading-normal text-muted-foreground">
        <ShieldCheckIcon className="mt-px size-4 shrink-0 text-primary" strokeWidth={1.6} aria-hidden="true" />
        {shell.nav.privacy}
      </p>
    </div>
  )
}

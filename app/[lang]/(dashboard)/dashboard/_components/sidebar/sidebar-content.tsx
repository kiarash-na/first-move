"use client"

import { ShieldCheckIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useRef, type ReactNode } from "react"

import { Brand } from "@/components/brand/brand"
import { useDictionary, useLocale } from "../i18n-provider"
import { useStoreState } from "../store-provider"
import { revealActiveLink } from "./reveal-active-link"
import { SidebarNav } from "./sidebar-nav"
import { SidebarProject } from "./sidebar-project"

/**
 * What the sidebar holds, on desktop and in the mobile sheet: brand, open project, navigation,
 * privacy note. When the navigation overflows, the current page's link is scrolled into view.
 */
export function SidebarContent({ onNavigate, footer }: { onNavigate?: () => void; footer?: ReactNode }) {
  const lang = useLocale()
  const common = useDictionary("common")
  const shell = useDictionary("shell")
  const pathname = usePathname()
  const modules = useStoreState((state) => {
    const on = state.active?.meta.modules
    return on ? `${Boolean(on.quickCheck)}:${Boolean(on.businessPlan)}` : null
  })
  const scroller = useRef<HTMLDivElement>(null)

  // The nav items depend on the route and on the open project's modules.
  useEffect(() => {
    if (scroller.current) revealActiveLink(scroller.current)
  }, [pathname, modules])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-16 shrink-0 items-center border-b px-5">
        {/* No prefetch: it would preload the landing page's stylesheet, which the dashboard never uses (console warning). */}
        <Brand href={`/${lang}`} name={common.app.name} label={common.app.homeLabel} prefetch={false} />
      </div>
      <SidebarProject />
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto">
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

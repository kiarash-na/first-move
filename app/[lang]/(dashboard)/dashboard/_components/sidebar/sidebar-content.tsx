"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, type ReactNode } from "react"

import { Brand } from "@/components/brand/brand"
import { useDictionary, useLocale } from "../i18n-provider"
import { useStoreState } from "../store-provider"
import { useRail } from "./rail"
import { RailTooltip } from "./rail-tooltip"
import { revealActiveLink } from "./reveal-active-link"
import { SidebarNav } from "./sidebar-nav"
import { SidebarPrivacy } from "./sidebar-privacy"
import { SidebarProject } from "./sidebar-project"

/**
 * What the sidebar holds, on desktop and in the mobile sheet: brand, open project, navigation,
 * privacy note. When the navigation overflows, the current page's link is scrolled into view.
 * In the collapsed desktop rail (D-59) the brand shows its mark only, and the navigation scrolls
 * without a scrollbar, which would take a quarter of the rail where scrollbars are classic.
 */
export function SidebarContent({ onNavigate, footer }: { onNavigate?: () => void; footer?: ReactNode }) {
  const lang = useLocale()
  const common = useDictionary("common")
  const pathname = usePathname()
  const modules = useStoreState((state) => {
    const on = state.active?.meta.modules
    return on ? `${Boolean(on.quickCheck)}:${Boolean(on.businessPlan)}` : null
  })
  // Undefined in the mobile sheet, which has no rail.
  const collapsed = useRail()?.collapsed
  const scroller = useRef<HTMLDivElement>(null)

  // The nav items depend on the route and on the open project's modules. Expanding the rail makes
  // the list and the parts above it taller, which can push the current page out of view. React's
  // copy of the rail changes only after <html data-sidebar>, which CSS draws from, so the layout
  // read here is already the new one.
  useEffect(() => {
    if (scroller.current) revealActiveLink(scroller.current)
  }, [pathname, modules, collapsed])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-16 shrink-0 items-center border-b px-5 rail:justify-center rail:px-0">
        {/* No prefetch: it would preload the landing page's stylesheet, which the dashboard never uses (console warning). */}
        <RailTooltip label={common.app.homeLabel}>
          <Brand
            href={`/${lang}`}
            name={common.app.name}
            label={common.app.homeLabel}
            prefetch={false}
            className="rail:min-w-11 rail:justify-center"
            nameClassName="rail:hidden"
          />
        </RailTooltip>
      </div>
      <SidebarProject />
      {/* `scrollbar-width` (Chrome and Edge 121, Safari 18.2) and the WebKit pseudo-element for the older browsers Next.js supports. */}
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto rail:scrollbar-none rail:[&::-webkit-scrollbar]:hidden">
        <SidebarNav onNavigate={onNavigate} />
      </div>
      {footer}
      <SidebarPrivacy />
    </div>
  )
}

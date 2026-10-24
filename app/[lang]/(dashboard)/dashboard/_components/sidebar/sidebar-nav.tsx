"use client"

import { GaugeIcon, LayoutDashboardIcon, LayoutGridIcon, SlidersHorizontalIcon, type LucideIcon } from "lucide-react"

import { navSections, type NavSection } from "@/lib/dashboard/nav"
import { dashboardHref } from "@/lib/dashboard/routes"
import { lookup } from "@/lib/i18n/lookup"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../i18n-provider"
import { useStoreState } from "../store-provider"
import { NavLink } from "./nav-link"

const ICONS: Record<string, LucideIcon> = {
  overview: LayoutDashboardIcon,
  assumptions: SlidersHorizontalIcon,
  "quickCheck.results": GaugeIcon,
}

const SECTION_TONE: Record<NavSection["tone"], string> = {
  neutral: "text-muted-foreground",
  cool: "text-primary",
  hot: "text-hot",
}

/**
 * The dashboard navigation (D-07): all projects, then the open project's pages; a module's
 * steps show only when the module is on.
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const lang = useLocale()
  const shell = useDictionary("shell")
  const modules = useStoreState((state) => state.active?.meta.modules ?? null)

  return (
    <nav aria-label={shell.nav.label} className="flex flex-col gap-6 py-4">
      <ul className="flex flex-col">
        <li>
          <NavLink href={dashboardHref(lang)} label={shell.nav.start} icon={LayoutGridIcon} onNavigate={onNavigate} />
        </li>
      </ul>
      {modules &&
        navSections(modules).map((section) => (
          <div key={section.id} className="flex flex-col gap-1.5">
            <p
              id={`nav-section-${section.id}`}
              className={cn("px-4 font-mono text-xs tracking-[0.075em] uppercase", SECTION_TONE[section.tone])}
            >
              {shell.nav.sections[section.id]}
            </p>
            <ul aria-labelledby={`nav-section-${section.id}`} className="flex flex-col">
              {section.items.map((item) => (
                <li key={item.id}>
                  <NavLink
                    href={dashboardHref(lang, item.route)}
                    label={lookup(shell.nav.items, item.id) ?? item.id}
                    tone={item.tone}
                    step={item.step}
                    icon={ICONS[item.id]}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
    </nav>
  )
}

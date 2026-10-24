"use client"

import { navSections, type NavSection } from "@/lib/dashboard/nav"
import { dashboardHref } from "@/lib/dashboard/routes"
import { interpolate } from "@/lib/i18n/interpolate"
import { lookup } from "@/lib/i18n/lookup"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "../i18n-provider"
import { useStoreState } from "../store-provider"
import { NAV_ICONS, START_ICON } from "./nav-icons"
import { NavLink } from "./nav-link"
import { useRail } from "./rail"

const SECTION_TONE: Record<NavSection["tone"], string> = {
  neutral: "text-muted-foreground",
  cool: "text-primary",
  hot: "text-hot",
}

/** The short line that stands for a section title in the collapsed rail (D-59). */
const SECTION_LINE: Record<NavSection["tone"], string> = {
  neutral: "bg-muted-foreground",
  cool: "bg-primary",
  hot: "bg-hot",
}

/**
 * The dashboard navigation (D-07): all projects, then the open project's pages; a module's
 * steps show only when the module is on. In the collapsed rail (D-59) section titles become a
 * short line in the section colour and stay readable for screen readers.
 */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const lang = useLocale()
  const shell = useDictionary("shell")
  const modules = useStoreState((state) => state.active?.meta.modules ?? null)
  const rail = useRail()

  return (
    <nav aria-label={shell.nav.label} className="flex flex-col gap-6 py-4 rail:gap-4">
      <ul className="flex flex-col">
        <li>
          <NavLink href={dashboardHref(lang)} label={shell.nav.start} icon={START_ICON} onNavigate={onNavigate} />
        </li>
      </ul>
      {modules &&
        navSections(modules).map((section) => {
          const title = shell.nav.sections[section.id]
          return (
            <div key={section.id} className="flex flex-col gap-1.5">
              <p
                id={`nav-section-${section.id}`}
                className={cn("px-4 font-mono text-xs tracking-[0.075em] uppercase rail:sr-only", SECTION_TONE[section.tone])}
              >
                {title}
              </p>
              {rail && <span aria-hidden="true" className={cn("mx-auto my-1.5 hidden h-px w-6 rail:block", SECTION_LINE[section.tone])} />}
              <ul aria-labelledby={`nav-section-${section.id}`} className="flex flex-col">
                {section.items.map((item) => {
                  const label = lookup(shell.nav.items, item.id) ?? item.id
                  return (
                    <li key={item.id}>
                      <NavLink
                        href={dashboardHref(lang, item.route)}
                        label={label}
                        tooltip={interpolate(shell.nav.rail.entry, { section: title, label })}
                        tone={item.tone}
                        step={item.step}
                        icon={NAV_ICONS[item.id]}
                        onNavigate={onNavigate}
                      />
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
    </nav>
  )
}

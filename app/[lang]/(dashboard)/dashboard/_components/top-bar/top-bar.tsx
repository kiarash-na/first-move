"use client"

import { LanguageSwitch } from "@/components/language-switch/language-switch"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Separator } from "@/components/ui/separator"
import { useDictionary, useLocale } from "../i18n-provider"
import { ProjectMenu } from "../project-menu/project-menu"
import { MobileNav } from "../sidebar/mobile-nav"
import { ExportButton } from "./export-button"
import { ImportButton } from "./import-button"
import { ReportButton } from "./report-button"
import { SaveStatus } from "./save-status"

/**
 * The top bar (D-08): save status (always visible), Export, Import, Report (disabled, D-09),
 * language, theme and the project menu. No manual Save button. Below 768px Export, Import and
 * Report move into the project menu, and language and theme into the navigation sheet.
 */
export function TopBar() {
  const lang = useLocale()
  const common = useDictionary("common")
  const shell = useDictionary("shell")

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/90 px-[clamp(12px,2.4vw,40px)] backdrop-blur-md">
      <MobileNav />
      <div className="flex min-w-0 flex-1 items-center">
        <SaveStatus className="max-w-[min(22rem,100%)]" />
      </div>
      <div role="toolbar" aria-label={shell.topBar.label} className="flex items-center gap-1 max-sm:hidden">
        <ExportButton />
        <ImportButton />
        <ReportButton />
      </div>
      <Separator orientation="vertical" className="mx-1 h-6! max-sm:hidden" />
      <div className="flex items-center max-sm:hidden">
        <LanguageSwitch lang={lang} label={common.language.label} names={common.language.names} short={common.language.short} />
        <ThemeToggle labels={common.theme} />
      </div>
      <ProjectMenu />
    </header>
  )
}

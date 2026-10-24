"use client"

import { MenuIcon } from "lucide-react"
import { useLayoutEffect, useState } from "react"

import { LanguageSwitch } from "@/components/language-switch/language-switch"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useDictionary, useLocale } from "../i18n-provider"
import { SidebarContent } from "./sidebar-content"

/** The sidebar as a sheet below 900px (D-07, DESIGN-TOKENS §7), with language and theme in its footer. */
export function MobileNav() {
  const lang = useLocale()
  const common = useDictionary("common")
  const shell = useDictionary("shell")
  const [open, setOpen] = useState(false)
  // Transient: close when Activity hides the route (preserving-ui-state guide).
  useLayoutEffect(() => () => setOpen(false), [])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={shell.nav.open}>
          <MenuIcon strokeWidth={1.6} aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" closeLabel={shell.nav.close} className="w-[min(320px,88vw)] gap-0 p-0">
        <SheetTitle className="sr-only">{shell.nav.title}</SheetTitle>
        <SheetDescription className="sr-only">{shell.nav.label}</SheetDescription>
        <SidebarContent
          onNavigate={() => setOpen(false)}
          footer={
            <div className="flex shrink-0 items-center justify-between gap-2 border-t px-3 py-2">
              <LanguageSwitch lang={lang} label={common.language.label} names={common.language.names} short={common.language.short} />
              <ThemeToggle labels={common.theme} />
            </div>
          }
        />
      </SheetContent>
    </Sheet>
  )
}

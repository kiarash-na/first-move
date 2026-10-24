"use client"

import { ShieldCheckIcon } from "lucide-react"
import { useRef } from "react"

import { useDictionary } from "../i18n-provider"
import { useRail } from "./rail"
import { RailReveal } from "./rail-reveal"

/**
 * The privacy note at the foot of the sidebar. In the collapsed rail (D-59) it is a shield icon
 * with the note in its tooltip; the note stays readable for screen readers.
 */
export function SidebarPrivacy() {
  const shell = useDictionary("shell")
  const rail = useRail()
  const note = useRef<HTMLParagraphElement>(null)

  return (
    <>
      <p
        ref={note}
        tabIndex={rail ? -1 : undefined}
        className="flex shrink-0 items-start gap-2.5 border-t px-5 py-4 text-xs leading-normal text-muted-foreground outline-offset-[-2px] rail:sr-only"
      >
        <ShieldCheckIcon className="mt-px size-4 shrink-0 text-primary" strokeWidth={1.6} aria-hidden="true" />
        {shell.nav.privacy}
      </p>
      <RailReveal
        className="border-t py-2.5"
        icon={ShieldCheckIcon}
        iconClassName="text-primary"
        label={shell.nav.rail.privacy}
        tooltip={shell.nav.privacy}
        target={note}
      />
    </>
  )
}

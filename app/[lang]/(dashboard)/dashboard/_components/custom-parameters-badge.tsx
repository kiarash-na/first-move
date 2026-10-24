"use client"

import { SlidersHorizontalIcon } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { dashboardHref } from "@/lib/dashboard/routes"
import { cn } from "@/lib/utils"
import { useDictionary, useLocale } from "./i18n-provider"
import { useQuickCheck } from "./use-quick-check"

/**
 * "Custom parameters" (D-10): shown wherever Quick Check results appear while any TBL-4/5/6
 * default is overridden. Links to the Assumptions page, where the values can be reset.
 */
export function CustomParametersBadge({ className, linked = true }: { className?: string; linked?: boolean }) {
  const lang = useLocale()
  const copy = useDictionary("quick-check").ui.customParameters
  const { result } = useQuickCheck()
  if (!result?.flags.customParameters) return null
  const content = (
    <>
      <SlidersHorizontalIcon strokeWidth={1.8} aria-hidden="true" />
      {copy.label}
    </>
  )
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {linked ? (
          <Badge variant="hot" asChild className={cn("min-h-7", className)} data-slot="custom-parameters">
            <Link href={dashboardHref(lang, { page: "assumptions" })} aria-description={copy.hint}>
              {content}
            </Link>
          </Badge>
        ) : (
          <Badge variant="hot" className={className} data-slot="custom-parameters" tabIndex={0} aria-description={copy.hint}>
            {content}
          </Badge>
        )}
      </TooltipTrigger>
      <TooltipContent className="max-w-72">{copy.hint}</TooltipContent>
    </Tooltip>
  )
}

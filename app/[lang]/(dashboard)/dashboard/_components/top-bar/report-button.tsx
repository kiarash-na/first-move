"use client"

import { FileTextIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { dashboardHref } from "@/lib/dashboard/routes"
import { useDictionary, useLocale } from "../i18n-provider"
import { useStoreState } from "../store-provider"

/**
 * Opens the report of the open project (QCT-SCOPE-06 "Export Results", D-09, D-70), where the
 * browser prints it or saves it as a PDF. Text label from 1200px, icon below; like Export, it is
 * disabled while no project is open.
 */
export function ReportButton() {
  const lang = useLocale()
  const shell = useDictionary("shell")
  const hasActive = useStoreState((state) => state.active !== null)
  const content = (
    <>
      <FileTextIcon strokeWidth={1.6} aria-hidden="true" />
      <span className="max-xl:sr-only">{shell.topBar.report}</span>
    </>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {hasActive ? (
          <Button asChild variant="ghost" className="px-3 max-xl:size-11 max-xl:px-0">
            <Link href={dashboardHref(lang, { page: "report" })} aria-label={shell.topBar.report}>
              {content}
            </Link>
          </Button>
        ) : (
          <Button variant="ghost" disabled aria-label={shell.topBar.report} className="px-3 max-xl:size-11 max-xl:px-0">
            {content}
          </Button>
        )}
      </TooltipTrigger>
      <TooltipContent className="xl:hidden">{shell.topBar.report}</TooltipContent>
    </Tooltip>
  )
}

"use client"

import { FileTextIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDictionary } from "../i18n-provider"

/**
 * The report entry point (QCT-SCOPE-10), shown but disabled until the report exists (D-09).
 * It stays focusable (aria-disabled) so the "coming soon" tooltip can be reached by keyboard.
 */
export function ReportButton() {
  const shell = useDictionary("shell")

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          aria-disabled="true"
          aria-label={`${shell.topBar.report}: ${shell.topBar.reportSoon}`}
          className="cursor-not-allowed px-3 opacity-50 hover:bg-transparent max-xl:size-11 max-xl:px-0"
          onClick={(event) => event.preventDefault()}
        >
          <FileTextIcon strokeWidth={1.6} aria-hidden="true" />
          <span className="max-xl:sr-only">{shell.topBar.report}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{shell.topBar.reportSoon}</TooltipContent>
    </Tooltip>
  )
}

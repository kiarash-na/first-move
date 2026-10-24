"use client"

import { DownloadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDictionary } from "../i18n-provider"
import { useProjectActions } from "../project-actions/use-project-actions"
import { useStoreState } from "../store-provider"

/** Downloads the open project as `.firstmove.json` (D-13). Text label from 1200px, icon below. */
export function ExportButton() {
  const shell = useDictionary("shell")
  const hasActive = useStoreState((state) => state.active !== null)
  const { exportProject } = useProjectActions()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className="px-3 max-xl:size-11 max-xl:px-0"
          disabled={!hasActive}
          aria-label={shell.topBar.export}
          onClick={() => void exportProject()}
        >
          <DownloadIcon strokeWidth={1.6} aria-hidden="true" />
          <span className="max-xl:sr-only">{shell.topBar.export}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent className="xl:hidden">{shell.topBar.export}</TooltipContent>
    </Tooltip>
  )
}

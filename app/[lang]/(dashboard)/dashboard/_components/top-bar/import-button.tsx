"use client"

import { UploadIcon } from "lucide-react"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { EXPORT_EXTENSION } from "@/lib/storage"
import { useDictionary } from "../i18n-provider"
import { useImport } from "../import/import-provider"

/** Picks a `.firstmove.json` file and imports it (D-13, D-14). */
export function ImportButton() {
  const shell = useDictionary("shell")
  const { importFile } = useImport()
  const input = useRef<HTMLInputElement>(null)

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className="px-3 max-xl:size-11 max-xl:px-0"
            aria-label={shell.topBar.import}
            onClick={() => input.current?.click()}
          >
            <UploadIcon strokeWidth={1.6} aria-hidden="true" />
            <span className="max-xl:sr-only">{shell.topBar.import}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="xl:hidden">{shell.topBar.import}</TooltipContent>
      </Tooltip>
      <input
        ref={input}
        type="file"
        accept={`${EXPORT_EXTENSION},.json,application/json`}
        aria-label={shell.importFlow.choose}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ""
          if (file) void importFile(file)
        }}
      />
    </>
  )
}

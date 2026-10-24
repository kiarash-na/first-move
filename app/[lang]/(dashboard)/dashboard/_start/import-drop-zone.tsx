"use client"

import { FileUpIcon } from "lucide-react"
import { useRef, useState, type DragEvent } from "react"

import { Button } from "@/components/ui/button"
import { EXPORT_EXTENSION } from "@/lib/storage"
import { cn } from "@/lib/utils"
import { useDictionary } from "../_components/i18n-provider"
import { useImport } from "../_components/import/import-provider"

/** Import by drag and drop or the file picker (D-03, D-13); errors are shown by the shared import flow. */
export function ImportDropZone() {
  const start = useDictionary("start")
  const shell = useDictionary("shell")
  const { importFile } = useImport()
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const [busy, setBusy] = useState(false)
  const copy = start.import

  async function take(file: File | undefined) {
    if (!file || busy) return
    setBusy(true)
    try {
      await importFile(file)
    } finally {
      setBusy(false)
    }
  }

  function onDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    setOver(false)
    void take(event.dataTransfer.files[0])
  }

  return (
    <section
      aria-labelledby="import-title"
      data-over={over || undefined}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = "copy"
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={cn(
        "flex flex-col justify-between gap-6 border border-dashed p-[clamp(22px,3vw,40px)] transition-colors duration-[180ms]",
        over ? "border-primary bg-primary/5" : "border-control-border bg-transparent",
      )}
    >
      <div className="flex flex-col gap-4">
        <span className={cn("inline-flex size-12 items-center justify-center border", over ? "border-primary text-primary" : "text-muted-foreground")}>
          <FileUpIcon className="size-6" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-2">
          <h2 id="import-title" className="text-2xl leading-[1.15] font-[560] tracking-[-0.04em] [font-stretch:84%]">
            {over ? copy.drop : copy.title}
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">{copy.body}</p>
        </div>
      </div>
      <div>
        <Button variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? copy.busy : copy.choose}
        </Button>
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
            void take(file)
          }}
        />
      </div>
    </section>
  )
}

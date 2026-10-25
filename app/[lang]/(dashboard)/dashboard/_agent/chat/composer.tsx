"use client"

import { SendIcon, SquareIcon } from "lucide-react"
import { useId, useState, type KeyboardEvent, type Ref } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useDictionary } from "../../_components/i18n-provider"

/** The message field: Enter sends, Shift+Enter adds a line; while an answer streams, Stop ends it. */
export function Composer({ busy, onSend, onStop, ref }: { busy: boolean; onSend: (text: string) => void; onStop: () => void; ref?: Ref<HTMLTextAreaElement> }) {
  const copy = useDictionary("assistant").chat
  const [text, setText] = useState("")
  const id = useId()

  function send() {
    if (!text.trim() || busy) return
    onSend(text)
    setText("")
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    send()
  }

  return (
    <div data-slot="composer" className="flex items-end gap-2">
      <label htmlFor={id} className="sr-only">
        {copy.label}
      </label>
      <Textarea
        ref={ref}
        id={id}
        value={text}
        rows={1}
        placeholder={copy.placeholder}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
        className="min-h-11 max-h-40 resize-none py-2.5 text-sm"
      />
      {busy ? (
        <Button type="button" variant="secondary" size="icon" aria-label={copy.stop} onClick={onStop}>
          <SquareIcon strokeWidth={1.6} aria-hidden="true" />
        </Button>
      ) : (
        <Button type="button" size="icon" aria-label={copy.send} disabled={!text.trim()} onClick={send}>
          <SendIcon strokeWidth={1.6} aria-hidden="true" />
        </Button>
      )}
    </div>
  )
}

"use client"

import { MessageSquarePlusIcon } from "lucide-react"
import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import type { Provider } from "@/lib/assistant/providers/types"
import { interpolate } from "@/lib/i18n/interpolate"
import type { ProjectStoreState } from "@/lib/store"
import { useDictionary } from "../../_components/i18n-provider"
import { useStoreState } from "../../_components/store-provider"
import { ChatMessage } from "./chat-message"
import { Composer } from "./composer"
import { useAssistantChat } from "./use-assistant-chat"

const selectActive = (state: ProjectStoreState) => state.active
const EXAMPLES = ["result", "length", "missing"] as const

/** The conversation for the open project: messages, examples to start, and the message field. */
export function Chat({ provider, modelId, modelName, focusOnMount }: { provider: Provider; modelId: string; modelName: string; focusOnMount?: boolean }) {
  const copy = useDictionary("assistant")
  const chat = copy.chat
  const project = useStoreState(selectActive)
  const { items, proposals, busy, send, stop, retry, apply, dismiss, clear } = useAssistantChat({ provider, modelId })
  const field = useRef<HTMLTextAreaElement>(null)
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (focusOnMount) field.current?.focus()
  }, [focusOnMount])

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" })
  }, [items])

  return (
    <div data-slot="assistant-chat" className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
        <p className="truncate font-mono text-[11px] tracking-[0.06em] text-muted-foreground uppercase">{interpolate(chat.via, { model: modelName, provider: copy.providers[provider] })}</p>
        {items.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={clear}>
            <MessageSquarePlusIcon strokeWidth={1.6} aria-hidden="true" />
            {chat.clear}
          </Button>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {!project && <p className="text-sm text-muted-foreground">{chat.noProject}</p>}
        {items.length === 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-text-secondary">{chat.empty}</p>
            {EXAMPLES.map((example) => (
              <Button key={example} type="button" variant="outline" size="sm" className="h-auto min-h-11 justify-start py-2 text-left whitespace-normal normal-case tracking-normal" onClick={() => void send(chat.examples[example])}>
                {chat.examples[example]}
              </Button>
            ))}
          </div>
        )}
        {/* The log wraps the list (a list keeps its list role) and is there from the start, so the first answer is announced. */}
        <div role="log" aria-label={copy.panel.title} aria-busy={busy}>
          {items.length > 0 && (
            <ul className="flex flex-col gap-4">
              {items.map((item, index) => (
                <ChatMessage
                  key={item.id}
                  item={item}
                  proposals={proposals}
                  project={project}
                  last={index === items.length - 1}
                  onRetry={retry}
                  onApply={apply}
                  onDismiss={dismiss}
                />
              ))}
            </ul>
          )}
          <div ref={end} />
        </div>
      </div>
      <div className="flex flex-col gap-2 border-t px-4 py-3">
        <Composer ref={field} busy={busy} onSend={(text) => void send(text)} onStop={stop} />
        <p className="text-[11px] leading-snug text-muted-foreground">{interpolate(chat.privacy, { provider: copy.providers[provider] })}</p>
      </div>
    </div>
  )
}

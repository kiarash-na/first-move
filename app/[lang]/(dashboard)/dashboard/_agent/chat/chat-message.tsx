"use client"

import { BotIcon, RotateCcwIcon, TriangleAlertIcon, WrenchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Project } from "@/lib/project"
import { useDictionary } from "../../_components/i18n-provider"
import { MessageText } from "./message-text"
import { ReviewCard } from "./review-card"
import type { ChatItem, ProposalItem } from "./use-assistant-chat"

type ToolName = keyof ReturnType<typeof useDictionary<"assistant">>["chat"]["tools"]

/**
 * One message. The assistant's answers carry a visible "AI-generated" tag and
 * `data-ai-generated="true"` (AI Act Art. 50), their tool steps as quiet notes, review cards and,
 * after a failure, the reason and "Try again".
 */
export function ChatMessage({
  item,
  proposals,
  project,
  last,
  onRetry,
  onApply,
  onDismiss,
}: {
  item: ChatItem
  proposals: Record<string, ProposalItem>
  project: Project | null
  last: boolean
  onRetry: () => void
  onApply: (id: string, keys: string[]) => void
  onDismiss: (id: string) => void
}) {
  const copy = useDictionary("assistant")
  const chat = copy.chat

  if (item.role === "user") {
    return (
      <li data-slot="chat-message" data-role="user" className="ml-8 flex flex-col gap-1 self-end border border-border bg-muted px-3 py-2">
        <span className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground uppercase">{chat.you}</span>
        <p className="text-sm leading-relaxed whitespace-pre-line">{item.text}</p>
      </li>
    )
  }

  return (
    <li data-slot="chat-message" data-role="assistant" data-ai-generated="true" className="mr-4 flex flex-col gap-2">
      <Badge variant="hot">
        <BotIcon strokeWidth={1.6} aria-hidden="true" />
        {chat.aiLabel}
      </Badge>
      {item.tools.length > 0 && (
        <ul className="flex flex-col gap-0.5">
          {item.tools.map((tool, index) => (
            <li key={index} className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
              <WrenchIcon className="size-3" strokeWidth={1.6} aria-hidden="true" />
              {chat.tools[tool as ToolName] ?? tool}
            </li>
          ))}
        </ul>
      )}
      {item.text ? <MessageText text={item.text} /> : !item.done && <p className="text-sm text-muted-foreground">{chat.working}</p>}
      {item.proposals.map((id) =>
        proposals[id] ? <ReviewCard key={id} item={proposals[id]} project={project} onApply={(keys) => onApply(id, keys)} onDismiss={() => onDismiss(id)} /> : null,
      )}
      {item.error && (
        <div role="alert" className="flex flex-col gap-2 border border-hot/60 p-3 text-sm">
          <p className="flex items-start gap-2">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-hot" strokeWidth={1.6} aria-hidden="true" />
            {copy.errors[item.error]}
          </p>
          {last && item.error !== "aborted" && (
            <Button type="button" size="sm" variant="secondary" className="w-fit" onClick={onRetry}>
              <RotateCcwIcon strokeWidth={1.6} aria-hidden="true" />
              {chat.retry}
            </Button>
          )}
        </div>
      )}
    </li>
  )
}

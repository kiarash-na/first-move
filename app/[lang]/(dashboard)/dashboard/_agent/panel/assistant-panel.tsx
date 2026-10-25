"use client"

import { BotIcon, KeyRoundIcon, XIcon } from "lucide-react"
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { KEYS } from "@/lib/assistant/keys/registry"
import { ASSISTANT_MODELS, DEFAULT_MODEL } from "@/lib/assistant/providers/models"
import type { Provider } from "@/lib/assistant/providers/types"
import type { ProjectStoreState } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useDictionary } from "../../_components/i18n-provider"
import { useStoreState } from "../../_components/store-provider"
import { Chat } from "../chat/chat"
import type { ConnectOutcome } from "../key/key-setup"
import { useMaskedKey } from "../key/use-masked-key"
import { useVaultEntries } from "../key/use-vault-entries"
import { ConnectionView } from "./connection-view"
import { usePhone } from "./use-phone"
import { wrapTab } from "./wrap-tab"

const selectActiveId = (state: ProjectStoreState) => state.activeId

/**
 * A key already in memory decides the first provider (the Gateway key may come from the AI Plan
 * Score); with none — or both — OpenRouter is the default and the Gateway the second (owner,
 * 2026-10-25).
 */
const firstProvider = (): Provider => (KEYS.openrouter.read() || !KEYS.gateway.read() ? "openrouter" : "gateway")

/**
 * The assistant's panel (O7): a side sheet on the right from `md` up, the full screen on phones.
 * From `md` up it is not modal, so the page stays usable next to it. On phones it covers the
 * page, so it is modal there: `aria-modal` and Tab and Shift+Tab stay inside it. Esc and the
 * close button close it, focus moves into it on open and back to the launcher on close (the
 * launcher does that). It stays mounted while closed (`hidden`), so the conversation survives.
 * Loaded with the AI SDK on first open.
 */
export function AssistantPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const copy = useDictionary("assistant")
  const [provider, setProvider] = useState<Provider>(firstProvider)
  const [models, setModels] = useState<Record<Provider, string>>(DEFAULT_MODEL)
  const [outcome, setOutcome] = useState<ConnectOutcome | null>(null)
  const [view, setView] = useState<"chat" | "connection">("chat")
  const masked = useMaskedKey(provider)
  const { entries, refresh } = useVaultEntries()
  const projectId = useStoreState(selectActiveId)
  const panel = useRef<HTMLElement>(null)
  /** Once the user picks a provider by hand, the vault hint no longer switches it. */
  const picked = useRef(false)

  // A single remembered key decides the provider when memory holds none (D-50).
  useEffect(() => {
    if (picked.current || KEYS.gateway.read() || KEYS.openrouter.read()) return
    if (entries.length === 1 && entries[0].provider !== provider) setProvider(entries[0].provider)
  }, [entries, provider])
  const modal = usePhone()
  const titleId = useId()
  const showChat = masked !== null && view === "chat"
  const modelId = models[provider]
  const modelName = ASSISTANT_MODELS[provider].find((model) => model.id === modelId)?.name ?? modelId

  // Focus moves into the panel on open, unless the message field already took it.
  useEffect(() => {
    const target = panel.current
    if (open && target && !target.contains(document.activeElement)) target.focus()
  }, [open])

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && !event.defaultPrevented) {
      event.stopPropagation()
      onClose()
    }
    if (modal && panel.current) wrapTab(event, panel.current)
  }

  return (
    <section
      ref={panel}
      role="dialog"
      aria-modal={modal ? "true" : "false"}
      aria-labelledby={titleId}
      tabIndex={-1}
      hidden={!open}
      data-slot="assistant-panel"
      onKeyDown={onKeyDown}
      className={cn(
        "fixed inset-0 z-50 flex flex-col bg-background text-foreground outline-none md:left-auto md:w-[clamp(360px,32vw,480px)] md:border-l md:shadow-panel print:hidden",
        !open && "hidden",
      )}
    >
      {/* A div, not <header>: a header outside sectioning content is a second banner landmark (axe). */}
      <div className="flex items-center gap-2 border-b px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <BotIcon className="size-5 shrink-0" strokeWidth={1.6} aria-hidden="true" />
        <h2 id={titleId} className="text-base font-[560]">
          {copy.panel.title}
        </h2>
        <Badge variant="hot">{copy.panel.badge}</Badge>
        <div className="ml-auto flex items-center gap-1">
          {masked !== null && (
            <Button type="button" variant="ghost" size="icon" aria-label={copy.panel.settings} aria-pressed={view === "connection"} onClick={() => setView((current) => (current === "chat" ? "connection" : "chat"))}>
              <KeyRoundIcon strokeWidth={1.6} aria-hidden="true" />
            </Button>
          )}
          <Button type="button" variant="ghost" size="icon" aria-label={copy.panel.close} onClick={onClose}>
            <XIcon strokeWidth={1.6} aria-hidden="true" />
          </Button>
        </div>
      </div>
      {showChat ? (
        <Chat key={projectId ?? "none"} provider={provider} modelId={modelId} modelName={modelName} focusOnMount />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ConnectionView
            provider={provider}
            onProvider={(next) => {
              picked.current = true
              setProvider(next)
              setOutcome(null)
            }}
            masked={masked}
            entry={entries.find((entry) => entry.provider === provider)}
            onVaultChange={refresh}
            outcome={outcome}
            onOutcome={(next) => {
              setOutcome(next)
              setView(next ? "connection" : "chat")
            }}
            modelId={modelId}
            onModel={(id) => setModels((current) => ({ ...current, [provider]: id }))}
            onChat={() => setView("chat")}
          />
        </div>
      )}
    </section>
  )
}

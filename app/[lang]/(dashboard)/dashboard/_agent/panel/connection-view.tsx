"use client"

import { MessagesSquareIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import type { UnlockOutcome } from "@/lib/assistant/keys/unlock"
import type { Provider } from "@/lib/assistant/providers/types"
import type { VaultEntry } from "@/lib/assistant/vault/vault"
import { useDictionary } from "../../_components/i18n-provider"
import { KeySetup, type ConnectOutcome } from "../key/key-setup"
import { KeyStatus } from "../key/key-status"
import { ModelSelect } from "../key/model-select"
import { UnlockForm } from "../key/unlock-form"

/**
 * Key and model of the assistant: unlock a remembered key, connect a new one, or see the one in
 * use with what the provider said about it; then pick the model and go to the chat.
 */
export function ConnectionView({
  provider,
  onProvider,
  masked,
  entry,
  onVaultChange,
  outcome,
  onOutcome,
  modelId,
  onModel,
  onChat,
}: {
  provider: Provider
  onProvider: (provider: Provider) => void
  masked: string | null
  entry: VaultEntry | undefined
  onVaultChange: () => void
  outcome: ConnectOutcome | null
  onOutcome: (outcome: ConnectOutcome | null) => void
  modelId: string
  onModel: (modelId: string) => void
  onChat: () => void
}) {
  const copy = useDictionary("assistant")
  const [paste, setPaste] = useState(false)
  const [unlockNote, setUnlockNote] = useState<string | null>(null)

  function unlocked(result: UnlockOutcome) {
    onVaultChange()
    if (result.status === "ok") {
      setUnlockNote(null)
      onOutcome(null)
    } else setUnlockNote(copy.unlock[result.status === "wrong" ? "missing" : result.status])
  }

  return (
    <div data-slot="connection-view" className="flex flex-col gap-6 px-4 py-4">
      {masked ? (
        <>
          <KeyStatus provider={provider} masked={masked} outcome={outcome} entry={entry} onVaultChange={onVaultChange} />
          <ModelSelect key={provider} provider={provider} value={modelId} onChange={onModel} />
          <Button type="button" className="w-fit" onClick={onChat}>
            <MessagesSquareIcon strokeWidth={1.6} aria-hidden="true" />
            {copy.panel.back}
          </Button>
        </>
      ) : (
        <>
          {unlockNote && (
            <p role="status" className="text-sm text-hot">
              {unlockNote}
            </p>
          )}
          {entry && !paste ? (
            <UnlockForm
              copy={copy.unlock}
              provider={provider}
              providerName={copy.providers[provider]}
              entry={entry}
              onDone={unlocked}
              onRemoved={() => {
                setUnlockNote(null)
                onVaultChange()
              }}
              onOther={() => setPaste(true)}
            />
          ) : (
            <KeySetup
              key={provider}
              provider={provider}
              onProvider={(next) => {
                setPaste(false)
                onProvider(next)
              }}
              onConnected={onOutcome}
              onVaultChange={onVaultChange}
            />
          )}
        </>
      )}
    </div>
  )
}

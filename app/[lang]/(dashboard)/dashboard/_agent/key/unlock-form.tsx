"use client"

import { LockOpenIcon, Trash2Icon } from "lucide-react"
import { useId, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { unlockInto, type UnlockOutcome } from "@/lib/assistant/keys/unlock"
import type { Provider } from "@/lib/assistant/providers/types"
import { forgetKey, type VaultEntry } from "@/lib/assistant/vault/vault"
import { PIN_LENGTH } from "@/lib/assistant/vault/pin"
import { interpolate } from "@/lib/i18n/interpolate"
import { pinDigits } from "./pin-fields"

export interface UnlockCopy {
  title: string
  lead: string
  pin: string
  unlock: string
  unlocking: string
  wrong: string
  wiped: string
  missing: string
  unavailable: string
  other: string
  remove: string
}

/**
 * Unlocks a key remembered on this device (D-50): the PIN opens it straight into memory, so the
 * key never passes through this component. Wrong PINs show the attempts left; the fifth deletes
 * the key. "Remove" deletes the record without the PIN, so a forgotten PIN never traps it (D-50).
 * Shared by the assistant and the AI Plan Score.
 */
export function UnlockForm({
  copy,
  provider,
  providerName,
  entry,
  onDone,
  onRemoved,
  onOther,
}: {
  copy: UnlockCopy
  provider: Provider
  providerName: string
  entry: VaultEntry
  /** After an unlock, or when the record is gone (deleted, missing). */
  onDone: (outcome: UnlockOutcome) => void
  /** After "Remove" deleted the record. */
  onRemoved: () => void
  onOther?: () => void
}) {
  const [pin, setPin] = useState("")
  const [busy, setBusy] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [outcome, setOutcome] = useState<UnlockOutcome | null>(null)
  const pinId = useId()
  const statusId = useId()

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy || removing || pin.length !== PIN_LENGTH) return
    setBusy(true)
    const result = await unlockInto(provider, pin).catch((): UnlockOutcome => ({ status: "unavailable" }))
    setBusy(false)
    setPin("")
    setOutcome(result)
    if (result.status !== "wrong") onDone(result)
  }

  async function remove() {
    if (busy || removing) return
    setRemoving(true)
    await forgetKey(provider).catch(() => undefined)
    setRemoving(false)
    setPin("")
    onRemoved()
  }

  const status =
    outcome?.status === "wrong" ? interpolate(copy.wrong, { remaining: outcome.remaining }) : outcome && outcome.status !== "ok" ? copy[outcome.status] : busy ? copy.unlocking : null

  return (
    <form data-slot="unlock-form" onSubmit={submit} className="flex flex-col gap-3" noValidate>
      <h3 className="text-base font-[520]">{copy.title}</h3>
      <p className="text-sm leading-relaxed text-text-secondary">{interpolate(copy.lead, { provider: providerName, last4: entry.last4 })}</p>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={pinId} className="text-sm">
            {copy.pin}
          </label>
          <Input
            id={pinId}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={PIN_LENGTH}
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
            data-bwignore
            data-form-type="other"
            value={pin}
            onChange={(event) => setPin(pinDigits(event.target.value))}
            aria-describedby={statusId}
            className="max-w-40 font-mono tracking-[0.3em]"
          />
        </div>
        <Button type="submit" disabled={busy || removing || pin.length !== PIN_LENGTH}>
          <LockOpenIcon strokeWidth={1.6} aria-hidden="true" />
          {copy.unlock}
        </Button>
        {onOther && (
          <Button type="button" variant="ghost" onClick={onOther}>
            {copy.other}
          </Button>
        )}
        <Button type="button" variant="ghost" disabled={busy || removing} onClick={() => void remove()}>
          <Trash2Icon strokeWidth={1.6} aria-hidden="true" />
          {copy.remove}
        </Button>
      </div>
      <p id={statusId} role="status" className="min-h-5 text-sm text-text-secondary" data-outcome={outcome?.status ?? "none"}>
        {status}
      </p>
    </form>
  )
}

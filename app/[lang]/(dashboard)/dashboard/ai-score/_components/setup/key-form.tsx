"use client"

import { KeyRoundIcon, LoaderCircleIcon, Trash2Icon } from "lucide-react"
import { useId, useRef, useState, type KeyboardEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { GatewayClient } from "@/lib/assistant/gateway/client"
import { gatewayErrorCode, type GatewayErrorCode } from "@/lib/assistant/gateway/errors"
import { clearGatewayKey, isPlausibleGatewayKey, setGatewayKey } from "@/lib/assistant/gateway/key"
import type { UnlockOutcome } from "@/lib/assistant/keys/unlock"
import { EMPTY_VALUE } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { KeyNotice } from "../../../_agent/key/key-notice"
import { UnlockForm } from "../../../_agent/key/unlock-form"
import { useVaultEntries } from "../../../_agent/key/use-vault-entries"
import { formatUsd } from "./usd"
import { useMaskedGatewayKey } from "./use-gateway-key"

type Check = { state: "idle" } | { state: "invalid" } | { state: "checking" } | { state: "ok"; balance: number } | { state: "failed" | "rejected"; code: GatewayErrorCode }

/**
 * The bring-your-own-key field (D-71): the key goes into module memory (`setGatewayKey`) and the
 * field is emptied at once. The field has no name and sits in no form, so nothing submits it and
 * password managers get no login form to offer saving; their opt-out attributes say the same.
 * "Use key" (or Enter) checks it against the Gateway's credits endpoint and shows the balance; a
 * key the Gateway rejects is forgotten again. The page only ever shows the masked key.
 * The spending-limit and expiry notice must be confirmed first (O7). A Gateway key the user
 * remembered in the AI assistant's PIN vault (D-50) can be unlocked here; memory stays the default.
 */
export function KeyForm({ createClient }: { createClient: (key: string) => GatewayClient }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const text = copy.setup.key
  const masked = useMaskedGatewayKey()
  const input = useRef<HTMLInputElement>(null)
  const [check, setCheck] = useState<Check>({ state: "idle" })
  const [ack, setAck] = useState(false)
  const [paste, setPaste] = useState(false)
  const [unlockNote, setUnlockNote] = useState<string | null>(null)
  const { entries, refresh } = useVaultEntries()
  const remembered = entries.find((entry) => entry.provider === "gateway")
  const inputId = useId()
  const statusId = useId()

  async function submitKey() {
    const field = input.current
    if (!field || !ack || check.state === "checking") return
    const value = field.value
    if (!isPlausibleGatewayKey(value)) {
      setCheck({ state: "invalid" })
      return
    }
    setGatewayKey(value)
    field.value = ""
    setCheck({ state: "checking" })
    try {
      const credits = await createClient(value.trim()).credits()
      setCheck({ state: "ok", balance: Number(credits.balance) })
    } catch (error) {
      const code = gatewayErrorCode(error)
      if (code === "key") clearGatewayKey()
      setCheck({ state: code === "key" ? "rejected" : "failed", code })
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return
    event.preventDefault()
    void submitKey()
  }

  function forget() {
    clearGatewayKey()
    setCheck({ state: "idle" })
  }

  const status =
    check.state === "invalid"
      ? text.invalid
      : check.state === "checking"
        ? copy.setup.credits.checking
        : check.state === "ok"
          ? interpolate(copy.setup.credits.balance, { amount: Number.isFinite(check.balance) ? formatUsd(check.balance, lang, { min: 2, max: 2 }) : EMPTY_VALUE })
          : check.state === "failed" || check.state === "rejected"
            ? interpolate(copy.setup.credits[check.state], { reason: copy.errors[check.code] })
            : null

  function unlocked(outcome: UnlockOutcome) {
    refresh()
    setCheck({ state: "idle" })
    setUnlockNote(outcome.status === "ok" ? null : copy.setup.unlock[outcome.status === "wrong" ? "missing" : outcome.status])
  }

  return (
    <div data-slot="key-form" className="flex flex-col gap-4">
      {remembered && !masked && !paste && (
        <UnlockForm copy={copy.setup.unlock} provider="gateway" providerName={copy.setup.unlock.provider} entry={remembered} onDone={unlocked} onOther={() => setPaste(true)} />
      )}
      {unlockNote && (
        <p role="status" className="text-sm text-hot">
          {unlockNote}
        </p>
      )}
      <KeyNotice copy={copy.setup.notice} checked={ack} onChange={setAck} />
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-[17px] leading-snug font-[480]">
          {text.label}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            ref={input}
            id={inputId}
            type="password"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            data-1p-ignore
            data-lpignore="true"
            data-bwignore
            data-form-type="other"
            placeholder={text.placeholder}
            aria-invalid={check.state === "invalid" || undefined}
            aria-describedby={statusId}
            onChange={() => check.state === "invalid" && setCheck({ state: "idle" })}
            onKeyDown={onKeyDown}
            className="font-mono sm:max-w-md"
          />
          <Button type="button" variant="hot" disabled={!ack || check.state === "checking"} onClick={() => void submitKey()}>
            <KeyRoundIcon strokeWidth={1.6} aria-hidden="true" />
            {text.use}
          </Button>
        </div>
        <p id={statusId} role="status" className="min-h-6 text-sm leading-relaxed text-text-secondary" data-check={check.state}>
          {check.state === "checking" && <LoaderCircleIcon className="mr-2 inline size-4 motion-safe:animate-spin" strokeWidth={1.6} aria-hidden="true" />}
          {status}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="font-mono text-xs tracking-[0.06em] uppercase" data-key-state={masked ? "set" : "none"}>
          {masked ? interpolate(text.active, { masked }) : text.none}
        </p>
        {masked && (
          <Button type="button" variant="secondary" size="sm" onClick={forget}>
            <Trash2Icon strokeWidth={1.6} aria-hidden="true" />
            {text.forget}
          </Button>
        )}
      </div>
      <p className="max-w-[72ch] text-sm leading-relaxed text-text-secondary">{text.memory}</p>
      <p className="max-w-[72ch] text-sm leading-relaxed text-text-secondary">{text.where}</p>
    </div>
  )
}

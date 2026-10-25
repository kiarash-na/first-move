"use client"

import { KeyRoundIcon, LoaderCircleIcon, Trash2Icon, TriangleAlertIcon } from "lucide-react"
import { useId, useRef, useState, type KeyboardEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { isPlausibleKey, KEYS } from "@/lib/assistant/keys/registry"
import type { UnlockOutcome } from "@/lib/assistant/keys/unlock"
import { checkKey, type KeyCheck } from "@/lib/assistant/providers/check-key"
import { assistantErrorCode, type AssistantErrorCode } from "@/lib/assistant/providers/errors"
import type { Provider } from "@/lib/assistant/providers/types"
import { EMPTY_VALUE, formatDate } from "@/lib/i18n/format"
import { interpolate } from "@/lib/i18n/interpolate"
import type { Locale } from "@/lib/i18n/locales"
import { useDictionary, useLocale } from "../../../_components/i18n-provider"
import { KeyNotice } from "../../../_agent/key/key-notice"
import { UnlockForm } from "../../../_agent/key/unlock-form"
import { useMaskedKey } from "../../../_agent/key/use-masked-key"
import { useVaultEntries } from "../../../_agent/key/use-vault-entries"
import { formatUsd } from "./usd"

type Check = { state: "idle" } | { state: "invalid" } | { state: "checking" } | { state: "ok"; result: KeyCheck } | { state: "failed" | "rejected"; code: AssistantErrorCode }

type CreditsCopy = ReturnType<typeof useDictionary<"ai-score">>["setup"]["credits"]

/** What a checked key told us: the Gateway's balance, or the OpenRouter key's limit and expiry. */
function checkLines(result: KeyCheck, copy: CreditsCopy, lang: Locale): { text: string; warn: boolean }[] {
  const usd = (value: number | null) => (value === null || !Number.isFinite(value) ? EMPTY_VALUE : formatUsd(value, lang, { min: 2, max: 2 }))
  if (result.provider === "gateway") return [{ text: interpolate(copy.balance, { amount: usd(result.balance) }), warn: false }]
  const { limit, limitRemaining, limitReset, expiresAt } = result.info
  const reset = limitReset && limitReset in copy.resets ? ` ${interpolate(copy.limitReset, { reset: copy.resets[limitReset as keyof typeof copy.resets] })}` : ""
  return [
    { text: copy.accepted, warn: false },
    limit === null ? { text: copy.noLimit, warn: true } : { text: interpolate(copy.limit, { amount: usd(limit), remaining: usd(limitRemaining) }) + reset, warn: false },
    expiresAt ? { text: interpolate(copy.expires, { date: formatDate(expiresAt, lang) }), warn: false } : { text: copy.noExpiry, warn: true },
  ]
}

/**
 * The bring-your-own-key field of the chosen provider (D-71; OpenRouter by default since
 * 2026-10-25): the key goes into module memory (`KEYS[provider].set`, shared with the assistant)
 * and the field is emptied at once. The field has no name and sits in no form, so nothing submits
 * it and password managers get no login form to offer saving; their opt-out attributes say the
 * same. "Use key" (or Enter) checks it with the provider and shows what it said; a rejected key
 * is forgotten again. The page only ever shows the masked key. The spending-limit and expiry
 * notice must be confirmed first, for every key (O7). A key remembered in the AI assistant's PIN
 * vault (D-50) can be unlocked here; memory stays the default.
 */
export function KeyForm({ provider }: { provider: Provider }) {
  const lang = useLocale()
  const copy = useDictionary("ai-score")
  const text = copy.setup.key
  const credits = copy.setup.credits
  const masked = useMaskedKey(provider)
  const input = useRef<HTMLInputElement>(null)
  const [check, setCheck] = useState<Check>({ state: "idle" })
  const [ack, setAck] = useState(false)
  const [paste, setPaste] = useState(false)
  const [unlockNote, setUnlockNote] = useState<string | null>(null)
  const { entries, refresh } = useVaultEntries()
  const remembered = entries.find((entry) => entry.provider === provider)
  const inputId = useId()
  const statusId = useId()

  async function submitKey() {
    const field = input.current
    if (!field || !ack || check.state === "checking") return
    const value = field.value
    if (!isPlausibleKey[provider](value)) {
      setCheck({ state: "invalid" })
      return
    }
    KEYS[provider].set(value)
    field.value = ""
    setCheck({ state: "checking" })
    try {
      const result = await checkKey(provider, value.trim())
      setCheck({ state: "ok", result })
    } catch (error) {
      const code = assistantErrorCode(error)
      if (code === "key") KEYS[provider].clear()
      setCheck({ state: code === "key" ? "rejected" : "failed", code })
      if (code === "key") return
    }
    // The key is in use: the next key needs the notice confirmed again (O7).
    setAck(false)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return
    event.preventDefault()
    void submitKey()
  }

  function forget() {
    KEYS[provider].clear()
    setCheck({ state: "idle" })
    setAck(false)
  }

  const status =
    check.state === "invalid"
      ? [{ text: text.invalid[provider], warn: false }]
      : check.state === "checking"
        ? [{ text: credits.checking, warn: false }]
        : check.state === "ok"
          ? checkLines(check.result, credits, lang)
          : check.state === "failed" || check.state === "rejected"
            ? [{ text: interpolate(credits[check.state], { reason: copy.errors[check.code] }), warn: false }]
            : null

  function unlocked(outcome: UnlockOutcome) {
    refresh()
    setCheck({ state: "idle" })
    setUnlockNote(outcome.status === "ok" ? null : copy.setup.unlock[outcome.status === "wrong" ? "missing" : outcome.status])
  }

  return (
    <div data-slot="key-form" className="flex flex-col gap-4">
      {remembered && !masked && !paste && (
        <UnlockForm
          copy={copy.setup.unlock}
          provider={provider}
          providerName={copy.setup.providers[provider]}
          entry={remembered}
          onDone={unlocked}
          onRemoved={() => {
            setUnlockNote(null)
            refresh()
          }}
          onOther={() => setPaste(true)}
        />
      )}
      {unlockNote && (
        <p role="status" className="text-sm text-hot">
          {unlockNote}
        </p>
      )}
      <KeyNotice copy={{ ...copy.setup.notice, ...copy.setup.notice[provider] }} checked={ack} onChange={setAck} />
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-[17px] leading-snug font-[480]">
          {text.label[provider]}
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
        <div id={statusId} role="status" className="min-h-6 text-sm leading-relaxed text-text-secondary" data-check={check.state}>
          {check.state === "checking" && <LoaderCircleIcon className="mr-2 inline size-4 motion-safe:animate-spin" strokeWidth={1.6} aria-hidden="true" />}
          {status?.map((line) => (
            <p key={line.text} className="flex items-start gap-2">
              {line.warn && <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-hot" strokeWidth={1.6} aria-hidden="true" />}
              {line.text}
            </p>
          ))}
        </div>
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
      <p className="max-w-[72ch] text-sm leading-relaxed text-text-secondary">{text.memory[provider]}</p>
      <p className="max-w-[72ch] text-sm leading-relaxed text-text-secondary">{text.where[provider]}</p>
    </div>
  )
}

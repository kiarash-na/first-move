"use client"

import { KeyRoundIcon, LoaderCircleIcon } from "lucide-react"
import { useId, useRef, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { isPlausibleKey, KEYS } from "@/lib/assistant/keys/registry"
import { rememberCurrent } from "@/lib/assistant/keys/unlock"
import { checkKey, type KeyCheck } from "@/lib/assistant/providers/check-key"
import { assistantErrorCode, type AssistantErrorCode } from "@/lib/assistant/providers/errors"
import { PROVIDERS, type Provider } from "@/lib/assistant/providers/types"
import { pinProblem, type PinProblem } from "@/lib/assistant/vault/pin"
import { interpolate } from "@/lib/i18n/interpolate"
import { useDictionary } from "../../_components/i18n-provider"
import { KeyNotice } from "./key-notice"
import { PinFields } from "./pin-fields"

type Status = { state: "idle" } | { state: "invalid" } | { state: "checking" } | { state: "rejected"; code: AssistantErrorCode }

/** What a successful setup leaves: the key is in memory; the check and the vault may have failed. */
export interface ConnectOutcome {
  check: KeyCheck | null
  /** Why the check failed, when the key was kept anyway (network, provider trouble). */
  failure: AssistantErrorCode | null
  /** Whether "remember on this device" worked, or null when not asked for. */
  remembered: boolean | null
}

/**
 * Key setup of the assistant (O7, D-49, D-50): provider, key, how to keep it (this tab, or this
 * device under a PIN), and the required spending-limit and expiry notice. The key is checked with
 * the provider first; the field is emptied at once and has no name and no form submit target, so
 * nothing stores it and password managers get no login form.
 */
export function KeySetup({
  provider,
  onProvider,
  onConnected,
  onVaultChange,
}: {
  provider: Provider
  onProvider: (provider: Provider) => void
  onConnected: (outcome: ConnectOutcome) => void
  onVaultChange: () => void
}) {
  const copy = useDictionary("assistant")
  const text = copy.setup
  const input = useRef<HTMLInputElement>(null)
  const [remember, setRemember] = useState(false)
  const [pin, setPin] = useState("")
  const [repeat, setRepeat] = useState("")
  const [problem, setProblem] = useState<PinProblem | null>(null)
  const [ack, setAck] = useState(false)
  const [status, setStatus] = useState<Status>({ state: "idle" })
  const keyId = useId()
  const statusId = useId()
  const storageName = useId()

  async function submit(event: FormEvent) {
    event.preventDefault()
    const field = input.current
    if (!field || !ack || status.state === "checking") return
    const value = field.value.trim()
    if (!isPlausibleKey[provider](value)) {
      setStatus({ state: "invalid" })
      return
    }
    const pinIssue = remember ? pinProblem(pin, repeat) : null
    setProblem(pinIssue)
    if (pinIssue) return
    field.value = ""
    setStatus({ state: "checking" })
    let check: KeyCheck | null = null
    let failure: AssistantErrorCode | null = null
    try {
      check = await checkKey(provider, value)
    } catch (error) {
      failure = assistantErrorCode(error)
      // A key the provider refuses is never kept.
      if (failure === "key") {
        setStatus({ state: "rejected", code: failure })
        return
      }
    }
    KEYS[provider].set(value)
    let remembered: boolean | null = null
    if (remember) {
      remembered = await rememberCurrent(provider, pin).catch(() => false)
      setPin("")
      setRepeat("")
      onVaultChange()
    }
    setStatus({ state: "idle" })
    onConnected({ check, failure, remembered })
  }

  const message =
    status.state === "invalid"
      ? text.key.invalid
      : status.state === "checking"
        ? text.checking
        : status.state === "rejected"
          ? interpolate(text.rejected, { reason: copy.errors[status.code] })
          : null

  return (
    <form data-slot="key-setup" onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-base font-[520]">{text.title}</h3>
        <p className="text-sm leading-relaxed text-text-secondary">{text.lead}</p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-[520]">{text.provider.label}</legend>
        {PROVIDERS.map((option) => (
          <label key={option} className="flex cursor-pointer items-start gap-3 text-sm">
            <input type="radio" name={`${storageName}-provider`} value={option} checked={provider === option} onChange={() => onProvider(option)} className="mt-1 size-4 accent-primary" />
            <span className="flex flex-col">
              <span>{copy.providers[option]}</span>
              <span className="text-xs text-muted-foreground">{text.provider[option === "gateway" ? "gatewayHint" : "openrouterHint"]}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={keyId} className="text-sm font-[520]">
          {text.key.label}
        </label>
        <Input
          ref={input}
          id={keyId}
          type="password"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          data-1p-ignore
          data-lpignore="true"
          data-bwignore
          data-form-type="other"
          placeholder={text.key.placeholder[provider]}
          aria-invalid={status.state === "invalid" || undefined}
          aria-describedby={statusId}
          onChange={() => status.state === "invalid" && setStatus({ state: "idle" })}
          className="font-mono"
        />
        <p className="text-xs leading-relaxed text-muted-foreground">{text.key.where[provider]}</p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-[520]">{text.storage.label}</legend>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input type="radio" name={`${storageName}-storage`} checked={!remember} onChange={() => setRemember(false)} className="mt-1 size-4 accent-primary" />
          <span className="flex flex-col">
            <span>{text.storage.session}</span>
            <span className="text-xs text-muted-foreground">{text.storage.sessionHint}</span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input type="radio" name={`${storageName}-storage`} checked={remember} onChange={() => setRemember(true)} className="mt-1 size-4 accent-primary" />
          <span className="flex flex-col">
            <span>{text.storage.remember}</span>
            <span className="text-xs leading-relaxed text-muted-foreground">{text.storage.rememberHint}</span>
          </span>
        </label>
        {remember && <PinFields copy={text.pin} pin={pin} repeat={repeat} onPin={setPin} onRepeat={setRepeat} problem={problem} />}
      </fieldset>

      <KeyNotice copy={{ ...copy.notice, ...copy.notice[provider] }} checked={ack} onChange={setAck} />

      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={!ack || status.state === "checking"} className="w-fit">
          {status.state === "checking" ? <LoaderCircleIcon className="motion-safe:animate-spin" strokeWidth={1.6} aria-hidden="true" /> : <KeyRoundIcon strokeWidth={1.6} aria-hidden="true" />}
          {text.use}
        </Button>
        <p id={statusId} role="status" className="min-h-5 text-sm text-text-secondary" data-status={status.state}>
          {message}
        </p>
      </div>
    </form>
  )
}

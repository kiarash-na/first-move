"use client"

import { ExternalLinkIcon, TriangleAlertIcon } from "lucide-react"
import { useId } from "react"

export interface KeyNoticeCopy {
  title: string
  lead: string
  /** The provider's spending-limit option, phrased as its docs state it. */
  limit: string
  /** The provider's expiry option, or the honest note that there is none and the key should be rotated. */
  expiry: string
  docs: string
  docsUrl: string
  /** A second source, when the first does not cover the expiry rules. */
  docsExpiry?: string
  docsExpiryUrl?: string
  ack: string
  required: string
}

/**
 * The notice every key setup shows (O7, D-49): set a spending limit and an expiry date when you
 * create the key, with a required checkbox before the key is used. Shared by the assistant and
 * the AI Plan Score; each passes its own provider's copy.
 */
export function KeyNotice({ copy, checked, onChange }: { copy: KeyNoticeCopy; checked: boolean; onChange: (value: boolean) => void }) {
  const checkboxId = useId()
  const titleId = useId()
  const requiredId = useId()
  const links = [{ href: copy.docsUrl, label: copy.docs }, ...(copy.docsExpiry && copy.docsExpiryUrl ? [{ href: copy.docsExpiryUrl, label: copy.docsExpiry }] : [])]

  return (
    <section data-slot="key-notice" aria-labelledby={titleId} className="flex flex-col gap-3 border border-hot/60 p-4">
      <h3 id={titleId} className="flex items-start gap-2 text-base leading-snug font-[520]">
        <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-hot" strokeWidth={1.6} aria-hidden="true" />
        {copy.title}
      </h3>
      <p className="text-sm leading-relaxed text-text-secondary">{copy.lead}</p>
      <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed marker:text-hot">
        <li>{copy.limit}</li>
        <li>{copy.expiry}</li>
      </ul>
      <div className="flex flex-wrap gap-x-5">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 w-fit items-center gap-1.5 text-sm text-foreground underline decoration-1 underline-offset-4 hover:text-cool"
          >
            {link.label}
            <ExternalLinkIcon className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
          </a>
        ))}
      </div>
      <div className="flex items-start gap-3">
        <input
          id={checkboxId}
          type="checkbox"
          required
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-describedby={checked ? undefined : requiredId}
          className="mt-1 size-5 shrink-0 cursor-pointer accent-hot"
        />
        <div className="flex flex-col gap-1">
          <label htmlFor={checkboxId} className="cursor-pointer text-sm leading-relaxed">
            {copy.ack}
          </label>
          {!checked && (
            <p id={requiredId} className="text-xs text-muted-foreground">
              {copy.required}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

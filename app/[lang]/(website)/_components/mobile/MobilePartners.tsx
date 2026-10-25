'use client'

import { useRef, useState } from 'react'
import { PARTNER_PLACEHOLDERS } from '@/lib/landing/partners'
import { PartnerDialog } from '../sections/PartnerDialog'
import type { Landing } from '../types'

const SLOTS = Array.from({ length: PARTNER_PLACEHOLDERS }, (_, slot) => slot)

/**
 * "Supported by" on phones and tablets (D-69, D-LM-4): the placeholders as a still row,
 * each a button that opens the partner dialog; focus returns to the card that opened it.
 */
export function MobilePartners({ copy }: { copy: Landing['closing']['partners'] }) {
  const [open, setOpen] = useState(false)
  const cards = useRef<(HTMLButtonElement | null)[]>([])
  const opener = useRef(0)

  return (
    <div className="m-partners" role="region" aria-labelledby="m-partners-title" data-m-reveal>
      <h3 className="m-partners__label" id="m-partners-title">{copy.label}</h3>
      <ul className="m-partners__grid">
        {SLOTS.map((slot) => (
          <li key={slot}>
            <button
              ref={(card) => { cards.current[slot] = card }}
              type="button"
              className="m-partner"
              aria-haspopup="dialog"
              onClick={() => {
                opener.current = slot
                setOpen(true)
              }}
            >
              <span className="m-partner__logo" aria-hidden="true" />
              <span className="m-partner__name">{copy.placeholder}</span>{' '}
              <span className="m-partner__cta">{copy.cta}</span>
            </button>
          </li>
        ))}
      </ul>

      <PartnerDialog
        copy={copy.dialog}
        open={open}
        onOpenChange={setOpen}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          cards.current[opener.current]?.focus({ preventScroll: true })
        }}
      />
    </div>
  )
}

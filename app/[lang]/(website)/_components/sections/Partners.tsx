'use client'

import { useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { PARTNER_PLACEHOLDERS, PARTNER_REPEATS } from '@/lib/landing/partners'
import type { Landing } from '../types'
import { PartnerDialog } from './PartnerDialog'

const SLOTS = Array.from({ length: PARTNER_PLACEHOLDERS }, (_, slot) => slot)

/** Two halves of the track, each repeating the row; copy 0 is the one assistive tech and Tab reach. */
const COPIES = Array.from({ length: PARTNER_REPEATS * 2 }, (_, copy) => copy)

/**
 * "Brought to you by" (D-69): a slowly sliding row of partner placeholders below the methodology's
 * screening boundary. It pauses on hover, on focus and with its Pause button, goes back to its
 * start while a card has keyboard focus, and stands still with reduced motion (`story.css`).
 * A card opens the partner dialog.
 */
export function Partners({ copy }: { copy: Landing['closing']['partners'] }) {
  const [open, setOpen] = useState(false)
  const [paused, setPaused] = useState(false)
  const cards = useRef<(HTMLButtonElement | null)[]>([])
  const opener = useRef(0)

  const openFor = (slot: number) => {
    opener.current = slot
    setOpen(true)
  }

  return (
    <div className="partners" role="region" aria-labelledby="partners-title" data-reveal>
      <div className="partners__head">
        <h3 className="partners__label" id="partners-title">{copy.label}</h3>
        <button type="button" className="partners__toggle" onClick={() => setPaused((value) => !value)}>
          {paused ? <Play size={14} strokeWidth={1.8} aria-hidden="true" /> : <Pause size={14} strokeWidth={1.8} aria-hidden="true" />}
          {paused ? copy.play : copy.pause}
        </button>
      </div>

      <div className="partners__viewport">
        <div className="partners__track" data-paused={paused || undefined}>
          {COPIES.map((copyIndex) => (
            <ul key={copyIndex} className="partners__set" aria-hidden={copyIndex > 0 || undefined}>
              {SLOTS.map((slot) => (
                <li key={slot}>
                  <button
                    ref={copyIndex === 0 ? (card) => { cards.current[slot] = card } : undefined}
                    type="button"
                    className="partner-card"
                    tabIndex={copyIndex > 0 ? -1 : undefined}
                    aria-haspopup="dialog"
                    onClick={() => openFor(slot)}
                  >
                    <span className="partner-card__logo" aria-hidden="true" />
                    <span className="partner-card__name">{copy.placeholder}</span>{' '}
                    <span className="partner-card__cta">{copy.cta}</span>
                  </button>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <PartnerDialog
        copy={copy.dialog}
        open={open}
        onOpenChange={setOpen}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          // Without scrolling: the row is clipped, and keyboard focus brings it back to its start.
          cards.current[opener.current]?.focus({ preventScroll: true })
        }}
      />
    </div>
  )
}

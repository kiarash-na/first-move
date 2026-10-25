import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { PARTNER_CONTACT_URL, PARTNER_PLACEHOLDERS } from '@/lib/landing/partners'
import { MobilePartners } from './MobilePartners'

const copy = en.closing.partners

describe('MobilePartners', () => {
  it('is a still row of the placeholders, each a button that opens the partner dialog', () => {
    render(<MobilePartners copy={copy} />)
    const region = screen.getByRole('region', { name: copy.label })
    const cards = within(region).getAllByRole('button', { name: `${copy.placeholder} ${copy.cta}` })
    expect(cards).toHaveLength(PARTNER_PLACEHOLDERS)
    for (const card of cards) expect(card).toHaveAttribute('aria-haspopup', 'dialog')
    expect(screen.queryByRole('dialog')).toBeNull()

    fireEvent.click(cards[1])
    const dialog = screen.getByRole('dialog', { name: copy.dialog.title })
    expect(dialog).toHaveTextContent(copy.dialog.body)
    expect(within(dialog).getByRole('link', { name: `${copy.dialog.contact} ${copy.dialog.newTab}` })).toHaveAttribute('href', PARTNER_CONTACT_URL)
  })
})

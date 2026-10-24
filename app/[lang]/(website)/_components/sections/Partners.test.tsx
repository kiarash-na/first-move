import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { PARTNER_CONTACT_URL, PARTNER_PLACEHOLDERS } from '@/lib/landing/partners'
import { Partners } from './Partners'

const copy = en.closing.partners
const cardName = `${copy.placeholder} ${copy.cta}`

describe('landing Partners (D-69)', () => {
  it('labels the strip and offers each placeholder once to keyboard and screen reader users', () => {
    render(<Partners copy={copy} />)
    const region = screen.getByRole('region', { name: copy.label })
    expect(within(region).getAllByRole('button', { name: cardName })).toHaveLength(PARTNER_PLACEHOLDERS)
  })

  it('keeps the sliding copies out of the tab order and hidden from assistive tech', () => {
    const { container } = render(<Partners copy={copy} />)
    const hidden = container.querySelectorAll('.partners__set[aria-hidden="true"] .partner-card')
    expect(hidden.length).toBeGreaterThan(0)
    for (const card of hidden) expect(card).toHaveAttribute('tabindex', '-1')
  })

  it('pauses and plays the strip', async () => {
    const user = userEvent.setup()
    const { container } = render(<Partners copy={copy} />)
    const track = container.querySelector('.partners__track')!
    expect(track).not.toHaveAttribute('data-paused')
    await user.click(screen.getByRole('button', { name: copy.pause }))
    expect(track).toHaveAttribute('data-paused', 'true')
    await user.click(screen.getByRole('button', { name: copy.play }))
    expect(track).not.toHaveAttribute('data-paused')
  })

  it('opens the partner dialog with a link to the contact page in a new tab, and returns focus to the card', async () => {
    const user = userEvent.setup()
    render(<Partners copy={copy} />)
    const card = screen.getAllByRole('button', { name: cardName })[1]
    await user.click(card)
    const dialog = screen.getByRole('dialog', { name: copy.dialog.title })
    expect(dialog).toHaveTextContent(copy.dialog.body)
    const contact = within(dialog).getByRole('link', { name: `${copy.dialog.contact} ${copy.dialog.newTab}` })
    expect(contact).toHaveAttribute('href', PARTNER_CONTACT_URL)
    expect(contact).toHaveAttribute('target', '_blank')
    expect(contact).toHaveAttribute('rel', 'noopener noreferrer')
    await user.click(within(dialog).getByRole('button', { name: copy.dialog.close }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(card).toHaveFocus()
  })

  it('opens the dialog from a sliding copy too, and returns focus to the matching accessible card', async () => {
    const user = userEvent.setup()
    const { container } = render(<Partners copy={copy} />)
    const copyCard = container.querySelectorAll<HTMLButtonElement>('.partners__set[aria-hidden="true"] .partner-card')[2]
    await user.click(copyCard)
    expect(screen.getByRole('dialog', { name: copy.dialog.title })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.getAllByRole('button', { name: cardName })[2]).toHaveFocus()
  })
})

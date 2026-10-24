import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { PARTNER_CONTACT_URL } from '@/lib/landing/partners'
import { PartnerDialog } from './PartnerDialog'

const copy = en.closing.partners.dialog

describe('PartnerDialog (D-69)', () => {
  it('says how to become a partner and links the contact page in a new tab', () => {
    render(<PartnerDialog copy={copy} open onOpenChange={() => {}} onCloseAutoFocus={() => {}} />)
    const dialog = screen.getByRole('dialog', { name: copy.title })
    expect(dialog).toHaveAccessibleDescription(copy.body)
    const contact = within(dialog).getByRole('link', { name: `${copy.contact} ${copy.newTab}` })
    expect(contact).toHaveAttribute('href', PARTNER_CONTACT_URL)
    expect(contact).toHaveAttribute('target', '_blank')
    expect(contact).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('closes with its close button and hands focus back to the caller', async () => {
    const onOpenChange = vi.fn()
    const onCloseAutoFocus = vi.fn((event: Event) => event.preventDefault())
    const { rerender } = render(<PartnerDialog copy={copy} open onOpenChange={onOpenChange} onCloseAutoFocus={onCloseAutoFocus} />)
    await userEvent.click(screen.getByRole('button', { name: copy.close }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    rerender(<PartnerDialog copy={copy} open={false} onOpenChange={onOpenChange} onCloseAutoFocus={onCloseAutoFocus} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    // Radix hands focus back on the tick after the content unmounts.
    await waitFor(() => expect(onCloseAutoFocus).toHaveBeenCalled())
  })

  it('renders nothing while closed', () => {
    render(<PartnerDialog copy={copy} open={false} onOpenChange={() => {}} onCloseAutoFocus={() => {}} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

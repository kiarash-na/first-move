import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import common from '@/dictionaries/en/common.json'
import en from '@/dictionaries/en/landing.json'
import { MOBILE_CHAPTERS, MobileHeader } from './MobileHeader'

vi.mock('next/navigation', () => ({ usePathname: () => '/de' }))

describe('MobileHeader', () => {
  it('names the brand link by its text and where it leads, and sends Get Started to the dashboard', () => {
    render(<MobileHeader t={en} lang="de" language={common.language} />)
    expect(screen.getByRole('link', { name: `${en.header.brandName}, ${en.header.brandBack}` })).toHaveAttribute('href', '#m-overview')
    expect(screen.getByRole('link', { name: en.header.getStarted })).toHaveAttribute('href', '/de/dashboard')
  })

  it('opens a menu with the five chapters and the language switch, and closes it on a chapter link', () => {
    render(<MobileHeader t={en} lang="en" language={common.language} />)
    const toggle = screen.getByRole('button', { name: en.header.openMenu })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('navigation', { name: en.header.mobileNav })).toBeNull()

    fireEvent.click(toggle)
    const menu = screen.getByRole('navigation', { name: en.header.mobileNav })
    expect(screen.getByRole('button', { name: en.header.closeMenu })).toHaveAttribute('aria-expanded', 'true')
    for (const chapter of MOBILE_CHAPTERS) {
      expect(screen.getByRole('link', { name: en.header.nav[chapter.key] })).toHaveAttribute('href', `#${chapter.id}`)
    }
    expect(screen.getByRole('navigation', { name: common.language.label })).toBeInTheDocument()
    expect(menu).toContainElement(screen.getByRole('navigation', { name: common.language.label }))

    fireEvent.click(screen.getByRole('link', { name: en.header.nav.aiScore }))
    expect(screen.queryByRole('navigation', { name: en.header.mobileNav })).toBeNull()
  })

  it('closes on Escape and returns focus to the menu button', () => {
    render(<MobileHeader t={en} lang="en" language={common.language} />)
    fireEvent.click(screen.getByRole('button', { name: en.header.openMenu }))
    fireEvent.keyDown(window, { key: 'Escape' })
    const toggle = screen.getByRole('button', { name: en.header.openMenu })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })

  it('closes on a pointer down outside the header', () => {
    render(
      <>
        <MobileHeader t={en} lang="en" language={common.language} />
        <p>outside</p>
      </>,
    )
    fireEvent.click(screen.getByRole('button', { name: en.header.openMenu }))
    fireEvent.pointerDown(screen.getByText('outside'))
    expect(screen.queryByRole('navigation', { name: en.header.mobileNav })).toBeNull()
  })
})

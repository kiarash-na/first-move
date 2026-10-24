import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import common from '@/dictionaries/en/common.json'
import { Header } from './Header'

vi.mock('next/navigation', () => ({ usePathname: () => '/de' }))

describe('landing Header', () => {
  it('links the CTA to the localized dashboard and offers the language switch', () => {
    render(
      <Header
        t={en}
        lang="de"
        language={{ label: common.language.label, names: common.language.names, short: common.language.short }}
        onToolSelect={() => {}}
      />,
    )
    expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute('href', '/de/dashboard')
    expect(screen.getAllByRole('navigation', { name: common.language.label, hidden: true })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: 'EN, English' })[0]).toHaveAttribute('href', '/en')
  })

  it('names the brand link by its visible text and where it leads (WCAG 2.5.3 label in name)', () => {
    render(
      <Header
        t={en}
        lang="en"
        language={{ label: common.language.label, names: common.language.names, short: common.language.short }}
        onToolSelect={() => {}}
      />,
    )
    // jsdom gives the descriptor's line break no space; browsers do.
    const brand = screen.getByRole('link', { name: new RegExp(`^${en.header.brandName} 5GDHC ?screening, ${en.header.brandBack}$`) })
    expect(brand).toHaveAttribute('href', '#overview')
    expect(brand).not.toHaveAttribute('aria-label')
  })
})

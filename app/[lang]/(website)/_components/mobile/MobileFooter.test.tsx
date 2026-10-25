import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { MobileFooter } from './MobileFooter'

describe('MobileFooter', () => {
  it('links the tools to the localized dashboard, the methodology chapter and the top', () => {
    render(<MobileFooter t={en} lang="de" />)
    const copy = en.closing.footer
    const nav = screen.getByRole('navigation', { name: copy.nav })
    expect(within(nav).getByRole('link', { name: copy.quickCheck })).toHaveAttribute('href', '/de/dashboard')
    expect(within(nav).getByRole('link', { name: copy.businessModels })).toHaveAttribute('href', '/de/dashboard')
    expect(within(nav).getByRole('link', { name: copy.methodology })).toHaveAttribute('href', '#m-methodology')
    expect(screen.getByRole('link', { name: copy.backToTop })).toHaveAttribute('href', '#m-overview')
    expect(screen.getByRole('link', { name: `${copy.brandName} ${copy.brandTag}, ${copy.brandBack}` })).toHaveAttribute('href', '#m-overview')
    expect(screen.getByText(copy.openSource)).toBeInTheDocument()
  })

  it('links the six legal pages, the presentation and the source code, localized', () => {
    render(<MobileFooter t={en} lang="de" />)
    const nav = screen.getByRole('navigation', { name: en.closing.footer.legal.nav })
    expect(within(nav).getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/de/terms', '/de/privacy', '/de/cookies', '/de/imprint', '/de/ai', '/de/license',
      '/de/presentation',
      'https://github.com/kiarash-na/first-move',
    ])
    expect(within(nav).getByRole('link', { name: en.presentation.footer })).toHaveAttribute('href', '/de/presentation')
  })
})

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { MobileHero } from './MobileHero'

describe('MobileHero', () => {
  it('is the overview with the title, the intro, the district and its legend', () => {
    render(<MobileHero t={en} />)
    expect(document.getElementById('m-overview')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: en.hero.titleLabel })).toBeInTheDocument()
    expect(screen.getByText(en.hero.intro)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: en.mobile.hero.visualAlt })).toBeInTheDocument()
    expect(screen.getByText(en.mobile.hero.visualLabel)).toBeInTheDocument()
    for (const label of [en.hero.cooling, en.hero.heating, en.hero.temperature]) expect(screen.getByText(label)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: en.hero.discover })).toHaveAttribute('href', '#m-system')
  })

  it('leads to the two tools from the gateway', () => {
    render(<MobileHero t={en} />)
    const gateway = screen.getByRole('navigation', { name: /Two tools/ })
    expect(within(gateway).getByRole('link', { name: new RegExp(en.hero.tools.quickCheck.title) })).toHaveAttribute('href', '#m-quick-check')
    expect(within(gateway).getByRole('link', { name: new RegExp(en.hero.tools.businessModels.title) })).toHaveAttribute('href', '#m-business-models')
    expect(within(gateway).getByText(en.hero.tools.quickCheck.description)).toBeInTheDocument()
  })
})

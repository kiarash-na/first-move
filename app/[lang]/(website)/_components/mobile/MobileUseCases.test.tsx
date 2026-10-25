import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { MobileUseCases } from './MobileUseCases'

describe('MobileUseCases', () => {
  it('is the Business Models chapter: three use cases, the refurbishment first, and the eight input categories', () => {
    render(<MobileUseCases t={en} />)
    const copy = en.businessModels.useCases
    expect(document.getElementById('m-business-models')).toBeInTheDocument()
    const group = screen.getByRole('group', { name: copy.groupLabel })
    expect(within(group).getAllByRole('button')).toHaveLength(3)
    expect(within(group).getByRole('button', { name: new RegExp(copy.items.refurbishment.shortTitle) })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { level: 3, name: copy.items.refurbishment.title })).toBeInTheDocument()
    expect(screen.getByText(copy.items.refurbishment.focus)).toBeInTheDocument()
    const inputs = screen.getByRole('list', { name: copy.inputsLabel })
    expect(within(inputs).getAllByRole('listitem').map((item) => item.textContent)).toEqual(copy.inputs)
    // No link arrows on the state buttons (PLAN-LANDING-FIX-00 U-2 holds here too).
    expect(group.querySelectorAll('svg')).toHaveLength(0)
  })

  it('switches to the chosen use case', () => {
    render(<MobileUseCases t={en} />)
    const copy = en.businessModels.useCases
    fireEvent.click(screen.getByRole('button', { name: new RegExp(copy.items.rural.shortTitle) }))
    expect(screen.getByRole('heading', { level: 3, name: copy.items.rural.title })).toBeInTheDocument()
    expect(screen.getByText(copy.items.rural.description)).toBeInTheDocument()
    expect(screen.getByText(copy.items.rural.focus)).toBeInTheDocument()
  })
})

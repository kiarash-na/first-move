import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { levelKey, MobileQuickInputs, SCENARIOS } from './MobileQuickInputs'

describe('levelKey', () => {
  it('splits 0..100 into low, medium and high at 34 and 67', () => {
    expect(levelKey(0)).toBe('low')
    expect(levelKey(33)).toBe('low')
    expect(levelKey(34)).toBe('medium')
    expect(levelKey(66)).toBe('medium')
    expect(levelKey(67)).toBe('high')
    expect(levelKey(100)).toBe('high')
  })
})

describe('MobileQuickInputs', () => {
  it('offers the three scenarios, the dense one first, with the three parameters and their level words', () => {
    render(<MobileQuickInputs t={en} />)
    const copy = en.quickCheck.inputs
    expect(document.getElementById('m-quick-check')).toBeInTheDocument()
    const group = screen.getByRole('group', { name: copy.scenariosLabel })
    expect(group.querySelectorAll('button')).toHaveLength(3)
    expect(screen.getByRole('button', { name: copy.scenarios.urban })).toHaveAttribute('aria-pressed', 'true')
    for (const id of ['demand', 'source', 'capex'] as const) {
      expect(screen.getByText(copy.parameters[id].label)).toBeInTheDocument()
      expect(screen.getByText(copy.parameters[id].note)).toBeInTheDocument()
    }
    // Dense neighbourhood: demand 84 → High, source 62 → Medium, capex 58 → Medium.
    expect(screen.getAllByText(copy.high)).toHaveLength(1 + 3)
    expect(screen.getAllByText(copy.medium)).toHaveLength(2)
    expect(screen.getByText(copy.note)).toBeInTheDocument()
  })

  it('switches the bars and the level words with the scenario', () => {
    const { container } = render(<MobileQuickInputs t={en} />)
    const copy = en.quickCheck.inputs
    fireEvent.click(screen.getByRole('button', { name: copy.scenarios.rural }))
    expect(screen.getByRole('button', { name: copy.scenarios.rural })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: copy.scenarios.urban })).toHaveAttribute('aria-pressed', 'false')
    const rural = SCENARIOS.find((scenario) => scenario.id === 'rural')!.values
    const bars = Array.from(container.querySelectorAll<HTMLElement>('.m-bar'))
    expect(bars.map((bar) => bar.style.getPropertyValue('--value'))).toEqual([`${rural.demand}%`, `${rural.source}%`, `${rural.capex}%`])
    // Low-density area: demand 32 → Low.
    expect(screen.getAllByText(copy.low)).toHaveLength(1 + 3)
  })
})

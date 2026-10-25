import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { MobileRealityCheck } from './MobileRealityCheck'

describe('MobileRealityCheck', () => {
  it('lists the three risks as details, the first one open, and the rule that matters', () => {
    const { container } = render(<MobileRealityCheck t={en} />)
    const copy = en.businessModels.reality
    expect(document.getElementById('m-reality-check')).toBeInTheDocument()
    const details = Array.from(container.querySelectorAll<HTMLDetailsElement>('details'))
    expect(details).toHaveLength(3)
    expect(details.map((item) => item.open)).toEqual([true, false, false])
    for (const id of ['connection', 'source', 'finance'] as const) {
      expect(screen.getByText(copy.risks[id].title)).toBeInTheDocument()
      expect(screen.getByText(copy.risks[id].assumption)).toBeInTheDocument()
      expect(screen.getByText(copy.risks[id].text)).toBeInTheDocument()
    }
    expect(screen.getByText(copy.ruleLabel)).toBeInTheDocument()
    expect(screen.getByText(copy.rule)).toBeInTheDocument()
    expect(screen.getByText(copy.consoleTag)).toBeInTheDocument()
  })
})

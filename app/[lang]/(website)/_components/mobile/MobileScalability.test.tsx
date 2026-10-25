import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { MobileScalability } from './MobileScalability'

describe('MobileScalability', () => {
  it('shows the three items of the ledger', () => {
    render(<MobileScalability t={en} />)
    expect(document.getElementById('m-scalability')).toBeInTheDocument()
    for (const item of en.businessModels.scalability.items) {
      expect(screen.getByText(item.label)).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: item.title })).toBeInTheDocument()
      expect(screen.getByText(item.text)).toBeInTheDocument()
    }
  })
})

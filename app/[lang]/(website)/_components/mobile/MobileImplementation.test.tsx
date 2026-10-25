import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { MobileImplementation } from './MobileImplementation'

describe('MobileImplementation', () => {
  it('shows the four numbered steps without link arrows and continues to the AI Plan Score', () => {
    render(<MobileImplementation t={en} />)
    const copy = en.businessModels.implementation
    expect(document.getElementById('m-implementation')).toBeInTheDocument()
    const steps = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(steps).toHaveLength(4)
    steps.forEach((step, index) => {
      expect(within(step).getByText(String(index + 1).padStart(2, '0'))).toBeInTheDocument()
      expect(within(step).getByRole('heading', { level: 3, name: copy.steps[index].title })).toBeInTheDocument()
      expect(step.querySelectorAll('svg')).toHaveLength(0)
    })
    expect(screen.getByRole('link', { name: copy.link })).toHaveAttribute('href', '#m-ai-score')
  })
})

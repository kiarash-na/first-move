import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { BusinessModelStory } from './BusinessModelStory'

describe('landing BusinessModelStory', () => {
  it('renders the use cases from the dictionary and switches between them', () => {
    render(<BusinessModelStory t={en} />)
    const { items } = en.businessModels.useCases
    expect(screen.getByText(items.refurbishment.description)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: items.rural.shortTitle }))
    expect(screen.getByText(items.rural.description)).toBeInTheDocument()
  })
})

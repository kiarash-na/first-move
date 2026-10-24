import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { ProductStory } from './ProductStory'

describe('landing ProductStory', () => {
  it('renders the promise and both tools from the dictionary', () => {
    render(<ProductStory t={en} onToolSelect={() => {}} />)
    expect(screen.getByText(en.product.promise.kicker)).toBeInTheDocument()
    expect(document.getElementById('promise-title')).not.toBeNull()
    expect(screen.getAllByText(en.product.tools.kicker).length).toBeGreaterThan(0)
  })
})

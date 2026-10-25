import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import en from '@/dictionaries/en/landing.json'
import { MobilePromise } from './MobilePromise'

describe('MobilePromise', () => {
  it('is "The System" with the promise, the three audiences and the step to the tools', () => {
    render(<MobilePromise t={en} />)
    expect(document.getElementById('m-system')).toHaveAttribute('aria-labelledby', 'm-promise-title')
    expect(screen.getByText(en.product.promise.body)).toBeInTheDocument()
    for (const audience of en.product.audiences) {
      expect(screen.getByRole('heading', { level: 3, name: audience.title })).toBeInTheDocument()
      expect(screen.getByText(audience.text)).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: en.product.promise.link })).toHaveAttribute('href', '#m-tools')
  })
})

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RichText } from './rich-text'

describe('RichText', () => {
  it('turns newlines into <br> and *x* into <em>', () => {
    const { container } = render(<h2><RichText text={'First line\nSecond *serif* end'} /></h2>)
    expect(container.querySelectorAll('br')).toHaveLength(1)
    expect(container.querySelector('em')?.textContent).toBe('serif')
    expect(container.textContent).toBe('First lineSecond serif end')
  })

  it('leaves plain text untouched', () => {
    const { container } = render(<p><RichText text="Plain" /></p>)
    expect(container.querySelector('p')?.innerHTML).toBe('Plain')
  })
})

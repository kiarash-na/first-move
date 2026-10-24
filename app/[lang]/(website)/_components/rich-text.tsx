import { Fragment, type ReactNode } from 'react'

/**
 * Renders dictionary copy with two bits of markup: "\n" is a line break and
 * "*text*" is emphasis (the serif italic of the landing headlines).
 */
export function RichText({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 && <br />}
          {emphasize(line)}
        </Fragment>
      ))}
    </>
  )
}

function emphasize(line: string): ReactNode[] {
  return line.split('*').map((part, index) => (index % 2 === 1 ? <em key={index}>{part}</em> : part))
}

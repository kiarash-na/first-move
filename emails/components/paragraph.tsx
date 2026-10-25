import { Fragment } from "react"
import { COLORS, TEXT } from "../theme"

const TONES = {
  muted: { ...TEXT.small },
  strong: { ...TEXT.body, fontWeight: 600 },
  normal: TEXT.body,
} as const

/**
 * Text as paragraphs: a blank line starts a new paragraph, a single line break stays a break.
 * The text is never markup; the renderer escapes it.
 */
export function Paragraph({ text, tone = "normal" }: { text: string; tone?: keyof typeof TONES }) {
  const paragraphs = text
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} style={{ ...TONES[tone], color: tone === "muted" ? COLORS.muted : COLORS.ink }}>
          {paragraph.split("\n").map((line, lineIndex) => (
            <Fragment key={lineIndex}>
              {lineIndex > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
      ))}
    </>
  )
}

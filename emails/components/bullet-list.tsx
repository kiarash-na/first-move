import { ACCENTS, TEXT } from "../theme"
import type { Accent } from "../model"

/** A short list with square markers in the section's accent. */
export function BulletList({ items, accent }: { items: string[]; accent: Accent }) {
  return (
    <ul style={{ margin: "0 0 14px", padding: 0, listStyle: "none" }}>
      {items.map((item, index) => (
        <li key={index} style={{ ...TEXT.body, margin: "0 0 6px", paddingLeft: 16, position: "relative" }}>
          <span aria-hidden="true" style={{ color: ACCENTS[accent], fontFamily: TEXT.mono.fontFamily, marginLeft: -16, display: "inline-block", width: 16 }}>
            ■
          </span>
          {item}
        </li>
      ))}
    </ul>
  )
}

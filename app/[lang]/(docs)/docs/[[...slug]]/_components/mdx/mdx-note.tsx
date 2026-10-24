import type * as React from "react"

/** A highlighted note (`> …`), drawn like the notes of the legal pages; it is not a quotation. */
export function MdxNote({ children }: { children?: React.ReactNode }) {
  return (
    <div
      role="note"
      className="max-w-[68ch] border-l-2 border-hot bg-panel px-4 py-3 text-base leading-relaxed text-foreground [&_p]:text-foreground"
    >
      {children}
    </div>
  )
}

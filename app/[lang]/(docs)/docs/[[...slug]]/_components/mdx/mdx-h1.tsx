import type * as React from "react"

/** The page title (`# …`), styled like the title of a legal page. */
export function MdxH1({ children }: { children?: React.ReactNode }) {
  return (
    <h1 className="max-w-[24ch] text-[clamp(25px,3vw,35px)] leading-[1.1] font-[560] tracking-[-0.04em] [font-stretch:84%]">
      {children}
    </h1>
  )
}

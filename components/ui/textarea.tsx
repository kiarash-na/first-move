import * as React from "react"

import { cn } from "@/lib/utils"

/** Multi-line input in the style of `Input`: 0 radius, 1px line, grows with its text (DESIGN-TOKENS §5). */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content min-h-28 max-h-[28rem] w-full min-w-0 resize-y border border-input bg-control px-3.5 py-3 text-base leading-relaxed text-foreground transition-colors selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }

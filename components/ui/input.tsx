import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 border border-input bg-control px-3.5 text-base text-foreground transition-colors selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:inline-flex file:h-8 file:border-0 file:bg-transparent file:font-mono file:text-xs file:text-foreground file:uppercase",
        "aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  )
}

export { Input }

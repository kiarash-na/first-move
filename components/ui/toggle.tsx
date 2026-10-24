"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/** Selected = cyan text and border plus `aria-pressed` (DESIGN-TOKENS §5); `hot` uses orange. */
const toggleVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 border border-transparent font-mono text-xs tracking-[0.06em] whitespace-nowrap text-muted-foreground uppercase transition-colors duration-[180ms] hover:text-foreground disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "data-[state=on]:border-primary data-[state=on]:text-primary",
        outline:
          "border-control-border bg-control data-[state=on]:border-primary data-[state=on]:text-primary",
        hot: "border-control-border bg-control data-[state=on]:border-hot data-[state=on]:text-hot",
      },
      size: {
        default: "h-11 min-w-11 px-3",
        sm: "h-11 min-w-11 px-2",
        lg: "h-12 min-w-12 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }

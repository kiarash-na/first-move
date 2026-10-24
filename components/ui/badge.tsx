import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/** Outlined technical tag. Pair colour with an icon or text: state is never colour alone (§2). */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden border px-2 py-0.5 font-mono text-xs leading-normal tracking-[0.06em] whitespace-nowrap uppercase transition-colors [&>svg]:pointer-events-none [&>svg]:size-3.5",
  {
    variants: {
      variant: {
        default: "border-primary text-primary [a&]:hover:bg-primary/10",
        hot: "border-hot text-hot [a&]:hover:bg-hot/10",
        destructive: "border-destructive text-destructive [a&]:hover:bg-destructive/10",
        secondary: "border-control-border bg-control text-secondary-foreground [a&]:hover:border-foreground/45",
        outline: "border-border text-muted-foreground [a&]:hover:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

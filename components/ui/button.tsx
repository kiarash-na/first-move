import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const lift =
  "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"

/** DESIGN-TOKENS §5: 0 radius, 44px targets, mono 12px uppercase, hover lift 170ms ease-out. */
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2.5 font-mono text-xs leading-none font-semibold tracking-[0.06em] whitespace-nowrap uppercase transition-[translate,scale,background-color,border-color,color,opacity] duration-[170ms] ease-out select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: cn("bg-primary text-primary-foreground hover:bg-primary/90", lift),
        hot: cn("bg-hot text-hot-foreground hover:bg-hot/90", lift),
        destructive: cn("bg-destructive text-destructive-foreground hover:bg-destructive/90", lift),
        secondary: cn(
          "border border-control-border bg-control text-secondary-foreground hover:border-foreground/45",
          lift,
        ),
        outline: cn("border border-input bg-transparent text-foreground hover:bg-accent", lift),
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-11 gap-2 px-3",
        lg: "h-14 gap-[42px] px-6 text-[13px] sm:h-15",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

"use client"

import type * as React from "react"
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { useTheme } from "@/lib/theme/use-theme"
import { cn } from "@/lib/utils"

/** Toasts follow `<html data-theme>`; errors and warnings are orange with an icon (D-17). */
function Toaster({ toastOptions, ...props }: ToasterProps) {
  const [theme] = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-primary" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4 text-hot" />,
        error: <OctagonXIcon className="size-4 text-hot" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "0px",
        } as React.CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        classNames: { ...toastOptions?.classNames, toast: cn("font-sans shadow-none!", toastOptions?.classNames?.toast) },
      }}
      {...props}
    />
  )
}

export { Toaster }

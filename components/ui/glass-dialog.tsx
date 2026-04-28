"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface GlassDialogProps extends React.ComponentProps<typeof Dialog> {
  trigger?: React.ReactNode
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  size?: "sm" | "default" | "lg" | "xl"
}

function GlassDialog({
  trigger,
  title,
  description,
  children,
  className,
  size = "default",
  ...props
}: GlassDialogProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    default: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  }

  return (
    <Dialog {...props}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          "border border-white/20 bg-black/95 backdrop-blur-2xl",
          "shadow-[0_0_60px_rgba(255,59,48,0.2)]",
          sizeClasses[size],
          className
        )}
      >
        {(title || description) && (
          <DialogHeader className="space-y-3">
            {title && (
              <DialogTitle className="font-heading text-xl text-white">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-white/60">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        <div className="pt-2">{children}</div>
      </DialogContent>
    </Dialog>
  )
}

export { GlassDialog }

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { cva, type VariantProps } from "class-variance-authority"

const glassButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-heading font-semibold transition-all duration-150 ease-out active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: [
          "bg-[#ff3b30] text-white",
          "hover:bg-[#ff5a52] hover:shadow-[0_4px_20px_rgba(255,59,48,0.5)]",
          "shadow-[0_2px_12px_rgba(255,59,48,0.35)]",
          "after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity",
        ],
        secondary: [
          "bg-white/[0.08] text-white border border-white/[0.15]",
          "hover:bg-white/[0.15] hover:border-white/30 hover:shadow-[0_4px_20px_rgba(255,255,255,0.1)]",
          "shadow-[0_2px_8px_rgba(0,0,0,0.2)]",
        ],
        ghost: [
          "bg-transparent text-white/80",
          "hover:bg-white/[0.08] hover:text-white",
          "active:bg-white/[0.12]",
        ],
        outline: [
          "bg-transparent border-2 border-[#ff3b30] text-[#ff3b30]",
          "hover:bg-[#ff3b30]/10 hover:shadow-[0_0_20px_rgba(255,59,48,0.2)]",
          "active:bg-[#ff3b30]/20",
        ],
        glass: [
          "bg-white/[0.06] text-white border border-white/[0.12] backdrop-blur-xl",
          "hover:bg-white/[0.12] hover:border-white/25 hover:shadow-[0_8px_32px_rgba(255,255,255,0.08)]",
          "shadow-[0_4px_16px_rgba(0,0,0,0.2)]",
        ],
        accent: [
          "bg-gradient-to-r from-[#ff3b30] to-[#d63031] text-white",
          "hover:shadow-[0_4px_24px_rgba(255,59,48,0.45)] hover:brightness-105",
          "shadow-[0_2px_16px_rgba(255,59,48,0.35)]",
          "after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/10 after:to-transparent after:opacity-50",
        ],
      },
      size: {
        default: "h-12 px-6 py-2.5 text-sm rounded-xl tracking-wide",
        sm: "h-10 px-4 py-2 text-xs rounded-lg tracking-wide",
        lg: "h-16 px-10 py-4 text-base rounded-2xl tracking-wider uppercase",
        icon: "h-12 w-12 rounded-xl",
      },
      glow: {
        true: [
          "shadow-[0_0_40px_rgba(255,59,48,0.45)]",
          "hover:shadow-[0_0_60px_rgba(255,59,48,0.6)]",
          "animate-pulse-subtle",
        ],
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: false,
    },
  }
)

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  asChild?: boolean
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, glow, asChild = false, ...props }, ref) => {
    return (
      <Button
        className={cn(glassButtonVariants({ variant, size, glow }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
GlassButton.displayName = "GlassButton"

export { GlassButton, glassButtonVariants }

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

interface GlassCardProps extends React.ComponentProps<typeof Card> {
  variant?: "default" | "accent" | "subtle"
  glow?: boolean
}

function GlassCard({ className, variant = "default", glow = false, ...props }: GlassCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]",
        variant === "accent" && "border-[#ff3b30]/30 bg-[#ff3b30]/[0.05]",
        variant === "subtle" && "border-white/5 bg-white/[0.02]",
        glow && "shadow-[0_0_30px_rgba(255,59,48,0.15)]",
        className
      )}
      {...props}
    />
  )
}

function GlassCardHeader({ className, ...props }: React.ComponentProps<typeof CardHeader>) {
  return (
    <CardHeader
      className={cn("border-b border-white/10 pb-4", className)}
      {...props}
    />
  )
}

function GlassCardTitle({ className, ...props }: React.ComponentProps<typeof CardTitle>) {
  return (
    <CardTitle
      className={cn("font-heading text-white tracking-tight", className)}
      {...props}
    />
  )
}

function GlassCardDescription({ className, ...props }: React.ComponentProps<typeof CardDescription>) {
  return (
    <CardDescription
      className={cn("text-white/60", className)}
      {...props}
    />
  )
}

function GlassCardContent({ className, ...props }: React.ComponentProps<typeof CardContent>) {
  return (
    <CardContent
      className={cn("pt-4", className)}
      {...props}
    />
  )
}

function GlassCardFooter({ className, ...props }: React.ComponentProps<typeof CardFooter>) {
  return (
    <CardFooter
      className={cn("border-t border-white/10 bg-white/[0.02]", className)}
      {...props}
    />
  )
}

export {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
}

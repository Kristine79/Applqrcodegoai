"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { LucideIcon } from "lucide-react"

interface GlassTextareaProps extends React.ComponentProps<"textarea"> {
  label?: string
  icon?: LucideIcon
  error?: string
  hint?: string
  rows?: number
}

const GlassTextarea = React.forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ className, label, icon: Icon, error, hint, rows = 3, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <Label className="text-sm font-medium text-white/70 flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-[#ff3b30]" />}
            {label}
          </Label>
        )}
        <Textarea
          ref={ref}
          rows={rows}
          className={cn(
            "min-h-[80px] bg-white/[0.05] border-white/20 text-white placeholder:text-white/40",
            "focus:border-[#ff3b30]/50 focus:ring-2 focus:ring-[#ff3b30]/20",
            "rounded-xl px-4 py-3 font-heading resize-none",
            "transition-all duration-200",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-red-400" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-white/50">{hint}</p>
        )}
      </div>
    )
  }
)
GlassTextarea.displayName = "GlassTextarea"

export { GlassTextarea }

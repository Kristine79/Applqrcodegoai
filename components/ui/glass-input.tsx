"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LucideIcon } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

interface GlassInputProps extends React.ComponentProps<"input"> {
  label?: string
  icon?: LucideIcon
  error?: string
  hint?: string
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, icon: Icon, error, hint, id, ...props }, ref) => {
    const inputId = id || React.useId()
    const [isFocused, setIsFocused] = React.useState(false)

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <Label
            htmlFor={inputId}
            className={cn(
              "text-xs font-semibold flex items-center gap-2 transition-colors duration-200",
              error ? "text-red-400" : isFocused ? "text-[#ff3b30]" : "text-white/60"
            )}
          >
            {Icon && (
              <Icon className={cn(
                "w-3.5 h-3.5 transition-colors duration-200",
                error ? "text-red-400" : isFocused ? "text-[#ff3b30]" : "text-white/40"
              )} />
            )}
            <span className="uppercase tracking-wider">{label}</span>
          </Label>
        )}
        <div className="relative group">
          <Input
            id={inputId}
            ref={ref}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            className={cn(
              "h-12 bg-white/[0.04] text-white placeholder:text-white/30",
              "border border-white/[0.12] rounded-xl px-4 font-heading text-base",
              "transition-all duration-200 ease-out",
              "hover:bg-white/[0.06] hover:border-white/[0.18]",
              "focus:bg-white/[0.08] focus:border-[#ff3b30]/60 focus:outline-none",
              "focus:shadow-[0_0_0_3px_rgba(255,59,48,0.15),0_0_20px_rgba(255,59,48,0.1)]",
              error && [
                "border-red-500/60 bg-red-500/[0.05]",
                "focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]",
              ],
              Icon && "pl-11",
              className
            )}
            {...props}
          />
          {Icon && (
            <Icon className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 pointer-events-none",
              error ? "text-red-400" : isFocused ? "text-[#ff3b30]" : "text-white/30 group-hover:text-white/40"
            )} />
          )}
          <AnimatePresence>
            {isFocused && !error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#ff3b30]"
              />
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              id={`${inputId}-error`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-red-400 flex items-center gap-1.5 font-medium"
            >
              <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
              {error}
            </motion.p>
          ) : hint ? (
            <motion.p
              id={`${inputId}-hint`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-white/40"
            >
              {hint}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    )
  }
)
GlassInput.displayName = "GlassInput"

export { GlassInput }

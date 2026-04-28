"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { LucideIcon } from "lucide-react"

interface GlassSelectProps {
  label?: string
  icon?: LucideIcon
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
  error?: string
  hint?: string
}

function GlassSelect({
  label,
  icon: Icon,
  placeholder,
  value,
  onValueChange,
  children,
  className,
  error,
  hint,
}: GlassSelectProps) {
  return (
    <div className="space-y-2 w-full">
      {label && (
        <Label className="text-sm font-medium text-white/70 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-[#ff3b30]" />}
          {label}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={cn(
            "h-12 bg-white/[0.05] border-white/20 text-white",
            "focus:border-[#ff3b30]/50 focus:ring-2 focus:ring-[#ff3b30]/20",
            "rounded-xl px-4 font-heading",
            "transition-all duration-200",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className={cn(
            "bg-black/95 border-white/20 backdrop-blur-2xl",
            "rounded-xl"
          )}
        >
          {children}
        </SelectContent>
      </Select>
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

interface GlassSelectItemProps {
  value: string
  children: React.ReactNode
  icon?: LucideIcon
  className?: string
}

function GlassSelectItem({ value, children, icon: Icon, className }: GlassSelectItemProps) {
  return (
    <SelectItem
      value={value}
      className={cn(
        "text-white focus:bg-white/10 focus:text-white rounded-lg cursor-pointer",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-[#ff3b30]" />}
        {children}
      </div>
    </SelectItem>
  )
}

export {
  GlassSelect,
  GlassSelectItem,
  SelectGroup as GlassSelectGroup,
  SelectLabel as GlassSelectLabel,
  SelectSeparator as GlassSelectSeparator,
}

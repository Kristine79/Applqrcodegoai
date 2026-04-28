"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { LucideIcon } from "lucide-react"

interface GlassSwitchProps {
  id?: string
  label?: string
  description?: string
  icon?: LucideIcon
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
  disabled?: boolean
}

function GlassSwitch({
  id,
  label,
  description,
  icon: Icon,
  checked,
  onCheckedChange,
  className,
  disabled,
}: GlassSwitchProps) {
  const switchId = id || React.useId()

  return (
    <div className={cn("flex items-start gap-3", className)}>
      {Icon && (
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#ff3b30]/10 text-[#ff3b30] shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            {label && (
              <Label
                htmlFor={switchId}
                className="text-sm font-medium text-white cursor-pointer"
              >
                {label}
              </Label>
            )}
            {description && (
              <span className="text-xs text-white/50">{description}</span>
            )}
          </div>
          <Switch
            id={switchId}
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            className={cn(
              "data-[state=checked]:bg-[#ff3b30] data-[state=unchecked]:bg-white/20",
              "border-0"
            )}
          />
        </div>
      </div>
    </div>
  )
}

export { GlassSwitch }

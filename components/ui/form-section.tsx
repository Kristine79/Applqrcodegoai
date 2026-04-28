"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { LucideIcon } from "lucide-react"

interface FormSectionProps {
  id: string
  title: string
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
  defaultOpen?: boolean
  badge?: string
}

function FormSection({
  id,
  title,
  icon: Icon,
  children,
  className,
  defaultOpen = true,
  badge,
}: FormSectionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? id : undefined}
      className={cn("w-full", className)}
    >
      <AccordionItem
        value={id}
        className="border border-white/10 rounded-2xl bg-white/[0.03] backdrop-blur-xl overflow-hidden"
      >
        <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-white/[0.02] transition-colors [&[data-state=open]]:border-b [&[data-state=open]]:border-white/10">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#ff3b30]/20 text-[#ff3b30]">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="flex flex-col items-start">
              <span className="font-heading text-base text-white">{title}</span>
              {badge && (
                <span className="text-xs text-white/50">{badge}</span>
              )}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-5 py-4">
          <div className="space-y-4">
            {children}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export { FormSection }

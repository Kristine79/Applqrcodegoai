"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

const THEME_STORAGE_KEY = "carqr_theme"
type Theme = "dark" | "light"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = React.useState<Theme>("dark")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    if (saved) {
      setTheme(saved)
      document.documentElement.classList.toggle("light", saved === "light")
      document.documentElement.classList.toggle("dark", saved === "dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme: Theme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    document.documentElement.classList.toggle("light", newTheme === "light")
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  if (!mounted) {
    return (
      <div className={cn("w-10 h-10 rounded-full bg-white/5 animate-pulse", className)} />
    )
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className={cn(
        "relative w-10 h-10 rounded-full flex items-center justify-center",
        "bg-white/5 hover:bg-white/10 border border-white/10",
        "transition-colors duration-200",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={theme === "dark" ? "Включить светлую тему" : "Включить темную тему"}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "light" ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-slate-600" />
        )}
      </motion.div>
    </motion.button>
  )
}

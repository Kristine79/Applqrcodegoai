"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { GlassButton } from "./glass-button"
import { GlassCard, GlassCardContent } from "./glass-card"
import { ChevronRight, ChevronLeft, X, QrCode, Car, Share2 } from "lucide-react"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Добро пожаловать в CarQR",
    description: "Создайте QR-визитку для вашего автомобиля за 30 секунд. Другие водители смогут мгновенно связаться с вами при необходимости.",
    icon: QrCode,
  },
  {
    id: "create",
    title: "Быстрое создание",
    description: "Заполните марку, номер и контакты — всё остальное мы сделаем автоматически. Данные кодируются прямо в QR-код.",
    icon: Car,
  },
  {
    id: "share",
    title: "Мгновенный обмен",
    description: "Сохраните QR-код на телефон, распечатайте или поделитесь ссылкой. Ваши данные в безопасности.",
    icon: Share2,
  },
]

const ONBOARDING_STORAGE_KEY = "carqr_onboarding_completed"

interface OnboardingProps {
  className?: string
}

export function Onboarding({ className }: OnboardingProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState(0)
  const [hasCompleted, setHasCompleted] = React.useState(true)

  React.useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    if (!completed) {
      setHasCompleted(false)
      setIsOpen(true)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true")
    setHasCompleted(true)
    setIsOpen(false)
  }

  const handleSkip = () => {
    handleComplete()
  }

  const step = ONBOARDING_STEPS[currentStep]
  const Icon = step.icon
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1
  const isFirstStep = currentStep === 0

  if (hasCompleted) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center p-4",
            "bg-black/80 backdrop-blur-sm",
            className
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleSkip()
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md"
          >
            <GlassCard className="overflow-hidden" glow>
              {/* Header with skip */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-caption text-white/60">
                    Шаг {currentStep + 1} из {ONBOARDING_STEPS.length}
                  </span>
                </div>
                <button
                  onClick={handleSkip}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Пропустить"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              <GlassCardContent className="p-6 pt-4">
                {/* Progress bar */}
                <div className="flex gap-1 mb-6">
                  {ONBOARDING_STEPS.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-all duration-300",
                        index <= currentStep
                          ? "bg-[#ff3b30]"
                          : "bg-white/20"
                      )}
                    />
                  ))}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="text-center space-y-4"
                  >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[#ff3b30]/20 flex items-center justify-center">
                      <Icon className="w-8 h-8 text-[#ff3b30]" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="heading-card">{step.title}</h3>
                      <p className="text-body-sm text-white/70">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/10">
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={handlePrev}
                    disabled={isFirstStep}
                    className={cn(isFirstStep && "opacity-0 pointer-events-none")}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Назад
                  </GlassButton>

                  <div className="flex gap-2">
                    <GlassButton
                      variant="default"
                      size="sm"
                      glow={isLastStep}
                      onClick={handleNext}
                    >
                      {isLastStep ? "Начать" : "Далее"}
                      {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
                    </GlassButton>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ResetOnboarding() {
  const handleReset = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    window.location.reload()
  }

  return (
    <button
      onClick={handleReset}
      className="text-xs text-white/40 hover:text-white/60 underline"
    >
      Показать подсказки
    </button>
  )
}

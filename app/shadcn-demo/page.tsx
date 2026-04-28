"use client"

import React, { useState } from "react"
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
} from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { FormSection } from "@/components/ui/form-section"
import { GlassDialog } from "@/components/ui/glass-dialog"
import { QRDisplay } from "@/components/ui/qr-display"
import {
  Car,
  User,
  Phone,
  Palette,
  Download,
  Share2,
  QrCode,
  Check,
  ChevronRight,
  BadgeCheck,
  MessageSquare,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

export default function ShadcnDemoPage() {
  const [showQR, setShowQR] = useState(false)
  const [formData, setFormData] = useState({
    carModel: "",
    plateNumber: "",
    ownerName: "",
    phone: "",
  })

  const handleGenerate = () => {
    if (!formData.carModel || !formData.phone) {
      toast.error("Заполните обязательные поля", {
        description: "Марка авто и телефон обязательны для заполнения",
      })
      return
    }
    setShowQR(true)
    toast.success("QR-код успешно создан!", {
      description: "Теперь вы можете скачать или поделиться им",
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff3b30] to-[#8b0000] flex items-center justify-center shadow-[0_0_20px_rgba(255,59,48,0.3)]">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-xl">CarQR</h1>
              <p className="text-xs text-white/50">shadcn/ui + Glassmorphism</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome Card */}
        <GlassCard variant="accent" glow>
          <GlassCardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#ff3b30]/20 flex items-center justify-center">
                <BadgeCheck className="w-6 h-6 text-[#ff3b30]" />
              </div>
              <div>
                <GlassCardTitle>Демо новых компонентов</GlassCardTitle>
                <GlassCardDescription>
                  shadcn/ui стилизованы под glassmorphism дизайн
                </GlassCardDescription>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-white/70 text-sm leading-relaxed">
              Все компоненты используют CSS-переменные shadcn, но адаптированы
              под тёмную тему с эффектом стекла. Сохранена совместимость с
              Radix UI primitives.
            </p>
          </GlassCardContent>
        </GlassCard>

        {/* Form Sections */}
        <div className="space-y-4">
          <FormSection
            id="car"
            title="Информация об автомобиле"
            icon={Car}
            badge="Шаг 1 из 3"
            defaultOpen={true}
          >
            <div className="grid gap-4">
              <GlassInput
                label="Марка и модель"
                placeholder="Например: BMW X5"
                icon={Car}
                value={formData.carModel}
                onChange={(e) =>
                  setFormData({ ...formData, carModel: e.target.value })
                }
                hint="Укажите полное название автомобиля"
              />
              <GlassInput
                label="Госномер"
                placeholder="А 123 БВ 777"
                icon={BadgeCheck}
                value={formData.plateNumber}
                onChange={(e) =>
                  setFormData({ ...formData, plateNumber: e.target.value })
                }
              />
            </div>
          </FormSection>

          <FormSection
            id="owner"
            title="Контактные данные"
            icon={User}
            badge="Шаг 2 из 3"
            defaultOpen={false}
          >
            <div className="grid gap-4">
              <GlassInput
                label="Ваше имя"
                placeholder="Иван Петров"
                icon={User}
                value={formData.ownerName}
                onChange={(e) =>
                  setFormData({ ...formData, ownerName: e.target.value })
                }
              />
              <GlassInput
                label="Телефон"
                placeholder="+7 (999) 123-45-67"
                icon={Phone}
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                hint="Номер будет виден при сканировании QR"
              />
            </div>
          </FormSection>

          <FormSection
            id="buttons"
            title="Быстрые кнопки"
            icon={MessageSquare}
            badge="Шаг 3 из 3"
            defaultOpen={false}
          >
            <div className="space-y-3">
              <p className="text-sm text-white/60">
                Выберите кнопки, которые будут отображаться на странице контакта:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "evacuation", label: "Эвакуация", icon: AlertTriangle },
                  { id: "damage", label: "Повреждение", icon: ShieldAlert },
                  { id: "message", label: "Сообщение", icon: MessageSquare },
                ].map((btn) => (
                  <GlassButton
                    key={btn.id}
                    variant="glass"
                    size="sm"
                    className="gap-2"
                  >
                    <btn.icon className="w-4 h-4" />
                    {btn.label}
                  </GlassButton>
                ))}
              </div>
            </div>
          </FormSection>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <GlassButton variant="glass" size="lg">
            <ChevronRight className="w-4 h-4 rotate-180 mr-2" />
            Назад
          </GlassButton>
          <GlassButton
            variant="default"
            size="lg"
            glow
            onClick={handleGenerate}
          >
            Создать QR
            <QrCode className="w-4 h-4 ml-2" />
          </GlassButton>
        </div>

        {/* Button Variants Demo */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Варианты кнопок</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-2">
              <GlassButton variant="default">Default</GlassButton>
              <GlassButton variant="secondary">Secondary</GlassButton>
              <GlassButton variant="ghost">Ghost</GlassButton>
              <GlassButton variant="outline">Outline</GlassButton>
              <GlassButton variant="glass">Glass</GlassButton>
              <GlassButton variant="accent">Accent</GlassButton>
              <GlassButton variant="default" glow>
                Glow
              </GlassButton>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Dialog Demo */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Диалоговые окна</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-2">
              <GlassDialog
                trigger={<GlassButton variant="glass">Открыть диалог</GlassButton>}
                title="Пример диалога"
                description="Это glassmorphism диалог на базе shadcn/ui"
                size="sm"
              >
                <div className="space-y-4">
                  <p className="text-white/70 text-sm">
                    Все диалоги используют backdrop-blur и адаптированы под
                    тёмную тему проекта.
                  </p>
                  <GlassButton
                    variant="default"
                    className="w-full"
                    onClick={() => toast.success("Действие выполнено!")}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Подтвердить
                  </GlassButton>
                </div>
              </GlassDialog>
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* QR Display Dialog */}
      <QRDisplay
        url={
          showQR
            ? `https://avtovisitka.ru/card/demo-${Date.now()}`
            : null
        }
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        onDownload={() =>
          toast.success("QR-код скачан", {
            description: "Файл сохранён в загрузки",
          })
        }
        onShare={() =>
          toast.success("Ссылка скопирована", {
            description: "Отправьте её друзьям",
          })
        }
      />
    </div>
  )
}

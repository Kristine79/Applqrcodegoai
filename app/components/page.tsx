"use client"

import React, { useState } from "react"
import Link from "next/link"
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
import { GlassTextarea } from "@/components/ui/glass-textarea"
import { GlassSelect, GlassSelectItem } from "@/components/ui/glass-select"
import { GlassSwitch } from "@/components/ui/glass-switch"
import { FormSection } from "@/components/ui/form-section"
import { GlassDialog } from "@/components/ui/glass-dialog"
import { QRDisplay } from "@/components/ui/qr-display"
import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
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
  CreditCard,
  Mail,
  Eye,
  EyeOff,
  Settings,
  Bell,
  Moon,
  Sun,
  Upload,
  Trash2,
  Edit3,
  Plus,
  Minus,
  Search,
  Filter,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Copy,
  MoreVertical,
  MoreHorizontal,
  GripVertical,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
} from "lucide-react"
import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function ComponentsPage() {
  const [switchState, setSwitchState] = useState(true)
  const [selectValue, setSelectValue] = useState("option1")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [textareaValue, setTextareaValue] = useState("")

  const demoUrl = "https://avtovisitka.ru/demo"

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff3b30] to-[#8b0000] flex items-center justify-center shadow-[0_0_20px_rgba(255,59,48,0.3)]">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading text-xl">
                Car
                <motion.span
                  animate={{ color: ["#ffffff", "#ff3b30", "#ffffff"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  QR
                </motion.span>
              </span>
            </Link>
            <h1 className="font-heading text-lg">Компоненты UI</h1>
            <Badge variant="outline" className="border-[#ff3b30]/30 text-[#ff3b30]">
              shadcn/ui
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Intro */}
        <GlassCard variant="accent" glow>
          <GlassCardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#ff3b30]/20 flex items-center justify-center">
                <BadgeCheck className="w-6 h-6 text-[#ff3b30]" />
              </div>
              <div>
                <GlassCardTitle>Glassmorphism UI Kit</GlassCardTitle>
                <GlassCardDescription>
                  Адаптированные компоненты shadcn/ui для CarQR
                </GlassCardDescription>
              </div>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <p className="text-white/70 text-sm leading-relaxed">
              Все компоненты используют CSS-переменные shadcn, но стилизованы под glassmorphism
              дизайн с тёмной темой и красным акцентом (#ff3b30).
            </p>
          </GlassCardContent>
        </GlassCard>

        {/* Buttons Section */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff3b30]/10 flex items-center justify-center">
              <Check className="w-4 h-4 text-[#ff3b30]" />
            </div>
            Кнопки (GlassButton)
          </h2>

          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Варианты кнопок</GlassCardTitle>
              <GlassCardDescription>
                6 вариантов стилей + glow эффект
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <GlassButton variant="default">Default</GlassButton>
                <GlassButton variant="secondary">Secondary</GlassButton>
                <GlassButton variant="ghost">Ghost</GlassButton>
                <GlassButton variant="outline">Outline</GlassButton>
                <GlassButton variant="glass">Glass</GlassButton>
                <GlassButton variant="accent">Accent</GlassButton>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex flex-wrap gap-2">
                <GlassButton variant="default" glow>Glow</GlassButton>
                <GlassButton variant="default" size="sm">Small</GlassButton>
                <GlassButton variant="default" size="lg">Large</GlassButton>
                <GlassButton variant="glass" size="icon">
                  <Plus className="w-4 h-4" />
                </GlassButton>
              </div>
            </GlassCardContent>
          </GlassCard>
        </section>

        {/* Inputs Section */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff3b30]/10 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-[#ff3b30]" />
            </div>
            Поля ввода
          </h2>

          <div className="grid gap-4">
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>GlassInput</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <GlassInput
                  label="Марка и модель"
                  placeholder="Например: BMW X5"
                  icon={Car}
                  hint="Укажите полное название автомобиля"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <GlassInput
                  label="Телефон"
                  placeholder="+7 (999) 123-45-67"
                  icon={Phone}
                  error={inputValue ? "" : "Введите номер телефона"}
                />
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>GlassTextarea</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <GlassTextarea
                  label="Сообщение"
                  placeholder="Введите ваше сообщение..."
                  icon={MessageSquare}
                  rows={4}
                  hint="Максимум 500 символов"
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                />
              </GlassCardContent>
            </GlassCard>
          </div>
        </section>

        {/* Select & Switch Section */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff3b30]/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-[#ff3b30]" />
            </div>
            Select & Switch
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>GlassSelect</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <GlassSelect
                  label="Выберите рамку QR"
                  icon={Palette}
                  placeholder="Выберите вариант"
                  value={selectValue}
                  onValueChange={setSelectValue}
                  hint="Выберите стиль рамки для QR-кода"
                >
                  <GlassSelectItem value="none">Без рамки</GlassSelectItem>
                  <GlassSelectItem value="label_bottom">С подписью</GlassSelectItem>
                  <GlassSelectItem value="solid_black">Чёрная</GlassSelectItem>
                  <GlassSelectItem value="bubble">Бабл</GlassSelectItem>
                  <GlassSelectItem value="circle">Круг</GlassSelectItem>
                </GlassSelect>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>GlassSwitch</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <GlassSwitch
                  label="Показывать контакты"
                  description="Отображать телефон на странице"
                  icon={Eye}
                  checked={switchState}
                  onCheckedChange={setSwitchState}
                />
                <Separator className="bg-white/10" />
                <GlassSwitch
                  label="Уведомления"
                  description="Получать уведомления о сканировании"
                  icon={Bell}
                  checked={!switchState}
                  onCheckedChange={(checked) => setSwitchState(!checked)}
                />
              </GlassCardContent>
            </GlassCard>
          </div>
        </section>

        {/* Form Section */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff3b30]/10 flex items-center justify-center">
              <ChevronDown className="w-4 h-4 text-[#ff3b30]" />
            </div>
            FormSection (Accordion)
          </h2>

          <FormSection
            id="car"
            title="Информация об автомобиле"
            icon={Car}
            badge="Шаг 1"
            defaultOpen={true}
          >
            <div className="grid gap-4">
              <GlassInput
                label="Марка и модель"
                placeholder="BMW X5"
                icon={Car}
              />
              <GlassInput
                label="Госномер"
                placeholder="А 123 БВ 777"
                icon={BadgeCheck}
              />
            </div>
          </FormSection>

          <FormSection
            id="owner"
            title="Контактные данные"
            icon={User}
            badge="Шаг 2"
            defaultOpen={false}
          >
            <div className="grid gap-4">
              <GlassInput
                label="Ваше имя"
                placeholder="Иван Петров"
                icon={User}
              />
              <GlassInput
                label="Телефон"
                placeholder="+7 (999) 123-45-67"
                icon={Phone}
              />
            </div>
          </FormSection>
        </section>

        {/* Dialogs Section */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff3b30]/10 flex items-center justify-center">
              <ExternalLink className="w-4 h-4 text-[#ff3b30]" />
            </div>
            Диалоги
          </h2>

          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>GlassDialog & QRDisplay</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="flex flex-wrap gap-2">
                <GlassDialog
                  trigger={<GlassButton variant="glass">GlassDialog</GlassButton>}
                  title="Пример диалога"
                  description="Это glassmorphism диалог на базе shadcn/ui"
                  size="sm"
                >
                  <div className="space-y-4">
                    <p className="text-white/70 text-sm">
                      Все диалоги используют backdrop-blur и адаптированы под тёмную тему.
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

                <GlassButton
                  variant="default"
                  onClick={() => setQrOpen(true)}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  QRDisplay
                </GlassButton>
              </div>
            </GlassCardContent>
          </GlassCard>
        </section>

        {/* Cards Section */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff3b30]/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-[#ff3b30]" />
            </div>
            Карточки (GlassCard)
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <GlassCard>
              <GlassCardContent className="pt-4 text-center">
                <div className="text-3xl font-heading text-white mb-1">12</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">Визиток</div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard variant="accent">
              <GlassCardContent className="pt-4 text-center">
                <div className="text-3xl font-heading text-[#ff3b30] mb-1">8</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">Активных</div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard variant="subtle">
              <GlassCardContent className="pt-4 text-center">
                <div className="text-3xl font-heading text-white/70 mb-1">100%</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">Готово</div>
              </GlassCardContent>
            </GlassCard>
          </div>

          <GlassCard glow>
            <GlassCardHeader>
              <GlassCardTitle>Glow эффект</GlassCardTitle>
              <GlassCardDescription>
                Карточка с красным свечением
              </GlassCardDescription>
            </GlassCardHeader>
            <GlassCardContent>
              <p className="text-white/70 text-sm">
                Используйте prop glow для добавления эффекта свечения вокруг карточки.
              </p>
            </GlassCardContent>
            <GlassCardFooter>
              <GlassButton variant="default" size="sm">
                Подробнее
              </GlassButton>
            </GlassCardFooter>
          </GlassCard>
        </section>

        {/* Badges & Separators */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff3b30]/10 flex items-center justify-center">
              <BadgeCheck className="w-4 h-4 text-[#ff3b30]" />
            </div>
            Badges & Separators
          </h2>

          <GlassCard>
            <GlassCardContent className="pt-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge className="border-[#ff3b30]/30 text-[#ff3b30] bg-[#ff3b30]/10">
                  Custom
                </Badge>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Готово
                </Badge>
                <Badge variant="outline" className="gap-1 text-yellow-500 border-yellow-500/30">
                  <AlertCircle className="w-3 h-3" />
                  Внимание
                </Badge>
                <Badge variant="outline" className="gap-1 text-red-500 border-red-500/30">
                  <Info className="w-3 h-3" />
                  Ошибка
                </Badge>
              </div>
            </GlassCardContent>
          </GlassCard>
        </section>

        {/* Scroll Area & Skeleton */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff3b30]/10 flex items-center justify-center">
              <Menu className="w-4 h-4 text-[#ff3b30]" />
            </div>
            ScrollArea & Skeleton
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>ScrollArea</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent>
                <ScrollArea className="h-[150px] pr-4">
                  <div className="space-y-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="p-3 bg-white/5 rounded-lg text-sm text-white/70"
                      >
                        Элемент списка #{i + 1}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Skeleton</GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-2">
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-4 w-[80%] bg-white/10" />
                <Skeleton className="h-4 w-[60%] bg-white/10" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
                  <Skeleton className="h-10 flex-1 rounded-lg bg-white/10" />
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        </section>

        {/* Tooltips */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ff3b30]/10 flex items-center justify-center">
              <Info className="w-4 h-4 text-[#ff3b30]" />
            </div>
            Tooltips
          </h2>

          <GlassCard>
            <GlassCardContent className="pt-4">
              <div className="flex flex-wrap gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <GlassButton variant="glass" size="icon">
                      <Info className="w-4 h-4" />
                    </GlassButton>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Информация о компоненте</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <GlassButton variant="glass" size="icon">
                      <Copy className="w-4 h-4" />
                    </GlassButton>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Копировать в буфер</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <GlassButton variant="glass" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </GlassButton>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Удалить элемент</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </GlassCardContent>
          </GlassCard>
        </section>

        {/* Usage Guide */}
        <GlassCard variant="subtle">
          <GlassCardHeader>
            <GlassCardTitle>Как использовать</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="space-y-4">
            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-white/80 overflow-x-auto">
              <p className="text-green-400">// Импорт компонентов</p>
              <p>{`import { GlassButton } from "@/components/ui/glass-button"`}</p>
              <p>{`import { GlassCard, GlassCardContent } from "@/components/ui/glass-card"`}</p>
              <p className="mt-2 text-green-400">// Использование</p>
              <p>{`<GlassCard variant="accent" glow>`}</p>
              <p className="ml-4">{`<GlassCardContent>`}</p>
              <p className="ml-8">{`<GlassButton variant="default">Click me</GlassButton>`}</p>
              <p className="ml-4">{`</GlassCardContent>`}</p>
              <p>{`</GlassCard>`}</p>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Footer */}
        <div className="text-center pt-8 pb-4">
          <p className="text-sm text-white/50">
            CarQR UI Kit · Based on shadcn/ui
          </p>
        </div>
      </div>

      {/* QR Display Dialog */}
      <QRDisplay
        url={qrOpen ? demoUrl : null}
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        onDownload={() => {
          toast.success("QR-код скачан")
          setQrOpen(false)
        }}
        onShare={() => {
          navigator.clipboard.writeText(demoUrl)
          toast.success("Ссылка скопирована")
        }}
        title="Демо QR-код"
        subtitle="avtovisitka.ru"
      />
    </div>
  )
}

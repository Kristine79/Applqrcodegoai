# CarQR + shadcn/ui Integration Guide

## Что было сделано

### 1. Инициализация shadcn/ui
- Установлен shadcn/ui CLI v4 с Radix UI базой
- Настроены CSS переменные для тёмной темы
- Сохранён существующий glassmorphism дизайн

### 2. Установленные компоненты
```bash
npx shadcn@latest add button card input label accordion dialog badge tooltip separator scroll-area skeleton sonner
```

### 3. Созданные кастомные компоненты

Все компоненты находятся в `components/ui/` и адаптированы под glassmorphism-стиль проекта:

| Компонент | Описание | База shadcn |
|-----------|----------|-------------|
| `glass-card.tsx` | Карточка со стеклянным эффектом | `card.tsx` |
| `glass-button.tsx` | Кнопки с вариантами стилей | `button.tsx` |
| `glass-input.tsx` | Поле ввода со стеклом | `input.tsx` + `label.tsx` |
| `glass-dialog.tsx` | Диалоговое окно | `dialog.tsx` |
| `form-section.tsx` | Секция формы (accordion) | `accordion.tsx` |
| `qr-display.tsx` | Отображение QR-кода | `dialog.tsx` |

### 4. Демо и примеры
- `app/shadcn-demo/page.tsx` - демонстрация всех компонентов
- `app/cabinet/page-new.tsx` - пример использования в кабинете

## Использование компонентов

### GlassCard
```tsx
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
} from "@/components/ui/glass-card"

<GlassCard variant="default" glow>
  <GlassCardHeader>
    <GlassCardTitle>Заголовок</GlassCardTitle>
    <GlassCardDescription>Описание</GlassCardDescription>
  </GlassCardHeader>
  <GlassCardContent>Содержимое</GlassCardContent>
  <GlassCardFooter>Футер</GlassCardFooter>
</GlassCard>
```

**Варианты:**
- `variant="default"` - стандартный glassmorphism
- `variant="accent"` - с красным акцентом
- `variant="subtle"` - более прозрачный
- `glow` - добавляет красное свечение

### GlassButton
```tsx
import { GlassButton } from "@/components/ui/glass-button"

<GlassButton variant="default" size="lg" glow>
  Создать QR
</GlassButton>
```

**Варианты:**
- `variant="default"` - красная кнопка с glow
- `variant="secondary"` - полупрозрачная
- `variant="ghost"` - прозрачная
- `variant="outline"` - с красной рамкой
- `variant="glass"` - стеклянная
- `variant="accent"` - градиент красный
- `glow` - добавляет свечение

**Размеры:** `sm`, `default`, `lg`, `icon`

### GlassInput
```tsx
import { GlassInput } from "@/components/ui/glass-input"
import { Car } from "lucide-react"

<GlassInput
  label="Марка авто"
  placeholder="BMW X5"
  icon={Car}
  hint="Укажите полное название"
  error={errors.carModel}
/>
```

### FormSection (Accordion)
```tsx
import { FormSection } from "@/components/ui/form-section"
import { Car } from "lucide-react"

<FormSection
  id="car"
  title="Информация об авто"
  icon={Car}
  badge="Шаг 1"
  defaultOpen={true}
>
  {/* форма */}
</FormSection>
```

### QRDisplay (Dialog)
```tsx
import { QRDisplay } from "@/components/ui/qr-display"

<QRDisplay
  url={qrUrl}
  isOpen={showQR}
  onClose={() => setShowQR(false)}
  onDownload={handleDownload}
  onShare={handleShare}
  title="Ваш QR-код"
/>
```

### Toast уведомления
```tsx
import { toast } from "sonner"

toast.success("QR создан!", {
  description: "Теперь вы можете скачать его"
})

toast.error("Ошибка", {
  description: "Заполните все поля"
})
```

## Обновлённые файлы

### layout.tsx
- Добавлены `TooltipProvider` и `Toaster`
- Toaster настроен с `position="top-center" richColors`

### globals.css
- Сохранены кастомные glassmorphism переменные
- Добавлены CSS переменные shadcn для тёмной темы
- Цвета адаптированы под красный акцент (#ff3b30)

### lib/utils.ts
- Добавлен тип `CarCardData`
- Добавлены функции `encodeCardData` и `decodeCardData`

## Миграция существующих компонентов

### Было:
```tsx
<div className="glass-card p-4">
  <h2 className="heading-section">Заголовок</h2>
</div>
<button className="glass-panel p-3">Кнопка</button>
```

### Стало:
```tsx
<GlassCard>
  <GlassCardContent>
    <GlassCardTitle>Заголовок</GlassCardTitle>
  </GlassCardContent>
</GlassCard>
<GlassButton variant="glass">Кнопка</GlassButton>
```

## Запуск демо

```bash
npm run dev
```

Откройте:
- `/shadcn-demo` - демонстрация компонентов
- `/cabinet` - текущий кабинет

## Преимущества интеграции

1. **Accessibility** - все компоненты на базе Radix UI
2. **TypeScript** - полная типизация
3. **Consistency** - единая дизайн-система
4. **Maintainability** - легко обновлять
5. **Dark mode** - встроенная поддержка
6. **Animations** - плавные переходы

## Дальнейшие шаги

- [ ] Миграция оставшихся страниц на новые компоненты
- [ ] Добавление тестов для компонентов
- [ ] Создание Storybook для документации
- [ ] Добавление новых фич (таблицы, выпадающие списки)

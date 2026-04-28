# CarQR — Design System

## Visual Theme
**Dark glassmorphism with aggressive accent**

Физический контекст: водитель использует приложение на улице, возможно ночью или при ярком солнце. Тёмная тема снижает нагрузку на глаза и экономит батарею OLED-экранов. Glassmorphism создаёт ощущение глубины и современности без утяжеления интерфейса.

## Color Palette

### Strategy: Committed (один насыщенный акцент несёт 30-50% поверхности)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `oklch(12% 0.01 250)` | Фон страницы (не чистый чёрный) |
| `--bg-glass` | `rgba(255, 255, 255, 0.05)` | Стеклянные карточки |
| `--bg-glass-border` | `rgba(255, 255, 255, 0.1)` | Границы glass |
| `--accent-primary` | `#ff3b30` | Apple Red — CTA, иконки, ссылки |
| `--accent-glow` | `rgba(255, 59, 48, 0.3)` | Glow-эффекты |
| `--text-primary` | `oklch(98% 0 0)` | Основной текст |
| `--text-secondary` | `oklch(70% 0 0)` | Вторичный текст |
| `--text-tertiary` | `oklch(55% 0 0)` | Плейсхолдеры, подписи |
| `--success` | `oklch(65% 0.15 145)` | Успешные действия |
| `--destructive` | `#ff3b30` | Ошибки (используем accent) |

### Color Rules
- Никогда не использовать чистый `#000000` — оттеняем к brand hue
- Акцент #ff3b30 (Apple Red) — узнаваемый, заметный, ассоциируется с "важным"
- Glassmorphism для иерархии, не для декорации

## Typography

### Font Stack
- **Heading:** Oswald (condensed, visible from distance)
- **Body:** Inter (читаемый на малых размерах)

### Type Scale

| Style | Size | Weight | Line-height | Usage |
|-------|------|--------|-------------|-------|
| Display | 4rem / 64px | 500 | 0.85 | Hero заголовки |
| Section | 1.5rem / 24px | 500 | 1.2 | Заголовки секций |
| Card | 1.125rem / 18px | 500 | 1.3 | Заголовки карточек |
| Body | 1rem / 17px | 400 | 1.5 | Основной текст |
| Label | 0.875rem / 14px | 500 | 1.4 | Подписи полей |
| Caption | 0.6875rem / 11px | 600 | 1.2 | Метки, uppercase |

### Typography Rules
- Headings: uppercase для Display, normal case для остального
- Body: max 65ch line length
- Letter-spacing: tight для headings (+ tracking-tight)

## Components

### GlassCard
- `backdrop-blur: 2xl`
- `border-radius: 2rem` (32px)
- Background: `rgba(255, 255, 255, 0.03)`
- Border: `1px solid rgba(255, 255, 255, 0.1)`
- Shadow: `0 8px 32px rgba(0, 0, 0, 0.1)`
- Variants: default, hover-lift, glow (red accent)

### GlassButton
- Min height: 44px (touch target)
- Border-radius: 1rem (16px) или full для pill
- Variants:
  - **default:** red bg, white text, glow on hover
  - **secondary:** transparent, white border
  - **ghost:** transparent, minimal
  - **accent:** green bg for success states
- Active state: scale(0.95)

### GlassInput
- Height: 48px
- Border: 2px solid with focus transition to accent
- Background: `rgba(255, 255, 255, 0.05)`
- Placeholder: `text-tertiary`
- Error: red border + subtle glow

### FormSection (Accordion)
- Collapsible sections for progressive disclosure
- Chevron animation on expand
- Border-bottom separator

## Layout

### Spacing Scale
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

### Container
- Max-width: 640px (mobile-first)
- Padding: 1rem horizontal
- Centered layout

## Motion

### Principles
- Ease-out с экспоненциальными кривыми (ease-out-quart)
- Никакого bounce или elastic
- Не анимируем layout properties (width, height)
- Use transform и opacity

### Durations
- Micro (hover, focus): 150ms
- Standard (transitions): 300ms
- Emphasis (page transitions): 500ms

### Reduced Motion
- Respect `prefers-reduced-motion`
- Fallback to instant transitions

## Elevation

### Glass Layers
1. **Base:** Page background (oklch 12%)
2. **Glass Panel:** `backdrop-blur-xl`, elevated content
3. **Glass Card:** `backdrop-blur-2xl`, primary containers
4. **Floating:** Modals, tooltips (highest blur + shadow)

## Responsive Breakpoints
- **Mobile:** < 640px (primary)
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

## Iconography
- **Library:** Lucide React
- **Size:** 20px default, 24px for navigation
- **Stroke-width:** 2px
- **Color:** inherit from text

## Accessibility

### Contrast
- Minimum 4.5:1 for body text
- Minimum 3:1 for large text / UI elements

### Touch Targets
- Minimum 44×44px for interactive elements
- 8px spacing between adjacent targets

### Focus States
- Visible focus ring (2px accent color)
- Skip-to-content link
- Logical tab order

## Patterns

### Form Field
```
[Label — Caption style]
[Input with icon left]
[Error message — if applicable]
```

### Card Grid
- Single column on mobile
- 2 columns on tablet+
- Gap: 1rem

### Empty State
- Icon (48px)
- Heading (Section)
- Description (Body, secondary)
- CTA Button

## Files
- Glass components: `components/ui/glass-*.tsx`
- Base shadcn: `components/ui/*.tsx` (button, card, input, etc.)
- Global styles: `app/globals.css`
- Fonts: `app/layout.tsx` (Inter + Oswald via next/font)

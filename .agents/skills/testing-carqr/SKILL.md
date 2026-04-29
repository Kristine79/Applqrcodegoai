# Testing CarQR Application

## Overview
CarQR is a Next.js 15 / React 19 app for generating QR business cards for cars. It uses client-side encryption, localStorage persistence, and is deployed on Vercel.

## Dev Server Setup
```bash
cd /path/to/Applqrcodegoai
npm install
npm run dev -- -p 3001
```
- First compile of each page takes 4-10s (1500+ modules)
- Subsequent loads are fast (~100-300ms)

## Common Issues

### Stale Webpack Cache
After restarting the dev server, the browser may show `ChunkLoadError: Loading chunk app/page failed` or `__webpack_modules__[moduleId] is not a function`. Fix:
```bash
rm -rf .next
npm run dev -- -p 3001
```
Then hard-refresh the browser. The app has a built-in error page with "Обновить страницу" button that also works.

### Vercel Preview Authentication
Vercel preview deployments may require Vercel login. If you don't have Vercel credentials, test on localhost instead.

### Telegram Notification Error
`POST /api/notify` returns 500 because `TELEGRAM_BOT_TOKEN` is not set. This is a pre-existing issue unrelated to UI/UX changes. Ignore this error in console.

## Pages & Navigation
| Page | URL | Description |
|------|-----|-------------|
| Main | `/` | QR code generator form with accordion sections |
| Order | `/order` | Sticker order page |
| Privacy | `/privacy` | Privacy policy with `#data-processing` anchor section |
| Cabinet | `/cabinet` | User's saved cards (localStorage) |
| Card | `/card/[id]` | Public card view (encoded data in URL) |

## Key UI Elements
- **Footer**: Present on all pages. Contains "ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ" and "ОБРАБОТКА ДАННЫХ" links (10px uppercase text)
- **Form fields**: Have red asterisk (*) markers, `aria-label`, `aria-required`, `aria-invalid` attributes
- **Validation**: Inline Russian error messages on blur (e.g., "Введите марку и модель")
- **QR frame**: Default text is "СКАНИРУЙ МЕНЯ" (Russian)
- **"Как это работает?"**: Accordion section, expanded by default
- **PWA install banner**: Shows "Установите CarQR" at top of main page

## Testing Approaches

### Footer Link Testing
Footer links "Обработка данных" should navigate to `/privacy#data-processing` on all pages. Verify:
1. Hover over link — status bar shows `/privacy#data-processing`
2. Click — URL changes to include `#data-processing` fragment
3. "Обработка данных" section heading is visible in viewport
4. For same-page test on /privacy: page scrolls from footer to section

### Console Error Testing
Use Playwright via CDP (`http://localhost:29229`) for reliable console error checking:
```javascript
const { chromium } = require('playwright');
const browser = await chromium.connectOverCDP('http://localhost:29229');
// Navigate pages, collect console.error events
// Filter out extension errors (runtime.lastError, ERR_BLOCKED_BY_CLIENT)
```

### Form Validation Testing
1. Tab through empty required fields — Russian inline errors should appear
2. Submit empty form — all 4 errors shown
3. Fill valid data, submit — QR code generated

## Build & Lint
```bash
npm run build    # Next.js production build
npm run lint     # ESLint check
```

## Devin Secrets Needed
None required for testing. The app is fully client-side with localStorage.

Optional: `TELEGRAM_BOT_TOKEN` for notification testing (not required for UI/UX testing).

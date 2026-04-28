import type { Metadata } from 'next';
import { Inter, Oswald, Geist } from 'next/font/google';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import GlobalErrorDisplay from '@/components/GlobalErrorDisplay';
import ResizeObserverSuppressor from '@/components/ResizeObserverSuppressor';
import { cn } from "@/lib/utils";
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { Onboarding } from '@/components/ui/onboarding';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const oswald = Oswald({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'cyrillic'],
  variable: '--font-oswald',
});

export const metadata: Metadata = {
  title: 'CarQR — QR-визитка для вашего автомобиля',
  description: 'Создайте QR-код для автомобиля, чтобы другие водители могли связаться с вами при необходимости. Бесплатно, безопасно, без регистрации.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'CarQR',
    description: 'QR-визитка для вашего автомобиля',
    images: [{ url: '/logo.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CarQR',
    description: 'QR-визитка для вашего автомобиля',
    images: ['/logo.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={cn("dark", oswald.variable, "font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'CarQR',
              url: 'https://avtovisitka.ru',
              description: 'Создайте QR-код для автомобиля, чтобы другие водители могли связаться с вами при необходимости.',
              applicationCategory: 'UtilityApplication',
              operatingSystem: 'All',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'RUB',
              },
              inLanguage: 'ru',
            }),
          }}
        />
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#ff3b30" />
        <meta name="yandex-verification" content="bb7d85143dfd2c41" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Global error logging for debugging white screen issues
              window.onerror = function(message, source, lineno, colno, error) {
                console.error('Global error:', message, error);
                const errorDiv = document.getElementById('global-error-display');
                if (errorDiv) {
                  errorDiv.style.display = 'flex';
                  const msgElement = document.getElementById('global-error-message');
                  if (msgElement) msgElement.innerText = message;
                  const stackElement = document.getElementById('global-error-stack');
                  if (stackElement && error && error.stack) stackElement.innerText = error.stack;
                }
              };

              window.onunhandledrejection = function(event) {
                console.error('Unhandled rejection:', event.reason);
                const errorDiv = document.getElementById('global-error-display');
                if (errorDiv) {
                  errorDiv.style.display = 'flex';
                  const msgElement = document.getElementById('global-error-message');
                  if (msgElement) msgElement.innerText = 'Unhandled Promise Rejection: ' + event.reason;
                }
              };

              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-sans bg-[oklch(12%_0.01_250)] text-white selection:bg-apple-red selection:text-white" suppressHydrationWarning>
        <ResizeObserverSuppressor />
        <GlobalErrorDisplay />

        <ErrorBoundary>
          <TooltipProvider>
            <Onboarding />
            {children}
            <Toaster position="top-center" richColors />
          </TooltipProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

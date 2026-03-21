import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import GlobalErrorDisplay from '@/components/GlobalErrorDisplay';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'CarQR - Apple Glassmorphism Edition',
  description: 'Создание QR-визиток для автомобилей в стиле Apple Glassmorphism',
  openGraph: {
    title: 'CarQR',
    description: 'QR-визитка для вашего автомобиля',
    images: [{ url: '/logo.png?v=3' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CarQR',
    description: 'QR-визитка для вашего автомобиля',
    images: ['/logo.png?v=3'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#ff3b30" />
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
      <body className="font-sans bg-black text-white selection:bg-apple-red selection:text-white" suppressHydrationWarning>
        <GlobalErrorDisplay />

        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}

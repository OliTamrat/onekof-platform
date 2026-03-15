import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import { isGeezScript, type Locale } from '@/i18n/config';

export const metadata: Metadata = {
  title: {
    default: 'Onekof - Ethiopian Project Management Platform',
    template: '%s | Onekof',
  },
  description:
    'Modern project management and collaboration platform built for Ethiopian teams. Kanban boards, documentation, AI-powered workflows, and Ethiopian calendar support.',
  keywords: [
    'project management',
    'ethiopia',
    'jira alternative',
    'confluence alternative',
    'collaboration',
    'agile',
    'scrum',
    'kanban',
  ],
  authors: [{ name: 'Onekof Team' }],
  creator: 'Onekof',
  publisher: 'Onekof',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Onekof',
    title: 'Onekof - Ethiopian Project Management Platform',
    description:
      'Modern project management and collaboration platform built for Ethiopian teams.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onekof - Ethiopian Project Management Platform',
    description:
      'Modern project management and collaboration platform built for Ethiopian teams.',
    creator: '@onekof',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale() as Locale;
  const messages = await getMessages();
  const useGeezFont = isGeezScript(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Onekof" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'SF Pro Display';
              src: local('SF Pro Display'), local('SFProDisplay-Regular'), local('.SFNSDisplay');
              font-weight: 400;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'SF Pro Display';
              src: local('SF Pro Display Medium'), local('SFProDisplay-Medium');
              font-weight: 500;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'SF Pro Display';
              src: local('SF Pro Display Semibold'), local('SFProDisplay-Semibold');
              font-weight: 600;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'SF Pro Display';
              src: local('SF Pro Display Bold'), local('SFProDisplay-Bold');
              font-weight: 700;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'SF Pro Display';
              src: local('SF Pro Display Heavy'), local('SFProDisplay-Heavy');
              font-weight: 800;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'SF Pro Text';
              src: local('SF Pro Text'), local('SFProText-Regular'), local('.SFNSText');
              font-weight: 400;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'SF Pro Text';
              src: local('SF Pro Text Medium'), local('SFProText-Medium');
              font-weight: 500;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'SF Pro Text';
              src: local('SF Pro Text Semibold'), local('SFProText-Semibold');
              font-weight: 600;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'SF Pro Text';
              src: local('SF Pro Text Bold'), local('SFProText-Bold');
              font-weight: 700;
              font-style: normal;
              font-display: swap;
            }
            @font-face {
              font-family: 'AbyssinicaSIL';
              src: url('/fonts/AbyssinicaSIL-Regular.woff2') format('woff2'),
                   url('/fonts/AbyssinicaSIL-Regular.woff') format('woff');
              font-weight: normal;
              font-style: normal;
              font-display: swap;
            }
            :root {
              --font-display: "SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
              --font-body: "SF Pro Text", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
              --font-geez: "AbyssinicaSIL", "Nyala", "Abyssinica SIL", serif;
            }
            body {
              font-family: ${useGeezFont ? 'var(--font-geez)' : 'var(--font-body)'};
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
              font-feature-settings: "cv02", "cv03", "cv04", "cv11";
            }
            h1, h2, h3, h4, h5, h6 {
              font-family: ${useGeezFont ? 'var(--font-geez)' : 'var(--font-display)'};
              letter-spacing: -0.03em;
            }
            button, input, select, textarea {
              font-family: ${useGeezFont ? 'var(--font-geez)' : 'var(--font-body)'};
            }
          `
        }} />
      </head>
      <body className={cn('min-h-screen bg-white antialiased')}>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

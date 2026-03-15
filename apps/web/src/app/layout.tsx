import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function(){
              try {
                var theme = localStorage.getItem('theme');
                var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && systemDark)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch(e) {}
            })();
          `
        }} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1C8C7D" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Onekof" />
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
            :root {
              --font-display: "SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
              --font-body: "SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            }
            body {
              font-family: var(--font-body);
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
              font-feature-settings: "cv02", "cv03", "cv04", "cv11";
            }
            h1, h2, h3, h4, h5, h6 {
              font-family: var(--font-display);
              letter-spacing: -0.03em;
            }
            button, input, select, textarea {
              font-family: var(--font-body);
            }
          `
        }} />
      </head>
      <body className={cn('min-h-screen bg-white dark:bg-[#1B1F23] antialiased')}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

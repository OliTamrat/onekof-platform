import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';

// Inter — cross-platform professional font, SF Pro equivalent for non-Apple devices
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

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
    <html lang="en" suppressHydrationWarning className={inter.variable}>
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
        <meta name="theme-color" content="#2563EB" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Onekof" />
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'Abyssinica SIL';
              src: url('/fonts/AbyssinicaSIL-Regular.woff2') format('woff2');
              font-weight: 400;
              font-style: normal;
              font-display: swap;
            }
            :root {
              --font-abyssinica: "Abyssinica SIL";
            }
          `
        }} />
      </head>
      <body className={cn('min-h-screen bg-white dark:bg-[#1B1F23] antialiased', inter.className)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

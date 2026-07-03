import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';

// Inter — cross-platform professional font, SF Pro equivalent for non-Apple devices
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Playfair Display — editorial serif for landing page headings
const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: {
    default: 'Onekof — INSA Certified Project Management Platform for Ethiopian Teams',
    template: '%s | Onekof PM',
  },
  description:
    'Onekof is Ethiopia\'s first INSA-certified project management platform. Ethiopian calendar, Amharic & Oromo UI, budget tracking in ETB via Telebirr & CBE, on-premise deployment, and 7-day free trial. Built for how Ethiopian teams actually work.',
  keywords: [
    'Onekof',
    'Onekof PM',
    'INSA certified software',
    'INSA certified project management',
    'Ethiopian project management',
    'project management Ethiopia',
    'project management Africa',
    'Ethiopian calendar project management',
    'Amharic project management',
    'ETB budget tracking',
    'budget management Ethiopia',
    'Telebirr payment',
    'CBE Birr payment',
    'Jira alternative Ethiopia',
    'Jira alternative Africa',
    'project management platform',
    'kanban board Ethiopia',
    'data sovereignty Ethiopia',
    'on-premise deployment Ethiopia',
    'DAPS Analytics',
    'Ethiopian software',
  ],
  authors: [{ name: 'DAPS Analytics' }],
  creator: 'DAPS Analytics',
  publisher: 'Onekof',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Onekof',
    title: 'Onekof — INSA Certified Project Management for Ethiopian Teams',
    description:
      'Ethiopia\'s first INSA-certified PM platform. Ethiopian calendar, Amharic UI, ETB budgets via Telebirr & CBE, on-premise deployment. 7-day free trial.',
    images: [
      {
        url: '/images/dashboard-desktop.png',
        width: 1920,
        height: 1080,
        alt: 'Onekof project management dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onekof — INSA Certified Project Management for Ethiopian Teams',
    description:
      'INSA certified. Ethiopian calendar, Amharic UI, ETB budgets via Telebirr & CBE. 7-day free trial.',
    creator: '@onekof',
    images: ['/images/dashboard-desktop.png'],
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
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Onekof',
              alternateName: ['Onekof PM', 'Onekof Project Management'],
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              description: 'Project management platform built for Ethiopian and East African teams. Ethiopian calendar, 5 languages, ETB budget tracking, AI-powered documents.',
              url: 'https://onekof.com',
              image: 'https://onekof.com/images/dashboard-desktop.png',
              author: {
                '@type': 'Organization',
                name: 'DAPS Analytics',
                url: 'https://onekof.com/about',
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'ETB',
                description: 'Free plan available for teams up to 5 members',
              },
              featureList: [
                'Ethiopian Calendar Support',
                'Amharic, Oromo, Tigrinya, Somali, English UI',
                'ETB Budget Tracking',
                'AI Document Processing',
                'Kanban Boards',
                'Timeline & Gantt Charts',
                'On-premise Deployment Option',
                'Data Sovereignty',
              ],
            }),
          }}
        />
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
      <body className={cn('min-h-screen bg-white dark:bg-[#0B0E11] antialiased', inter.className)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

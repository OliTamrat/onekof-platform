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
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --font-sf-pro: "SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
              --font-sf-pro-text: "SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            }
            body {
              font-family: var(--font-sf-pro-text);
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
            h1, h2, h3, h4, h5, h6, button {
              font-family: var(--font-sf-pro);
            }
          `
        }} />
      </head>
      <body className={cn('min-h-screen bg-white antialiased')}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'Onekof cookie policy. Details on cookies used for authentication, preferences, and analytics on our project management platform.',
};

export default function CookiesLayout({ children }: { children: ReactNode }): ReactNode {
  return children;
}

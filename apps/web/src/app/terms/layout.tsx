import type { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Onekof terms of service. Subscription model, data ownership, and Ethiopian governing law for our project management platform.',
};

export default function TermsLayout({ children }: { children: ReactNode }): ReactNode {
  return children;
}

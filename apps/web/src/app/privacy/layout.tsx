import type { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Onekof privacy policy. Learn how we handle your data with three-tier deployment, data sovereignty for Ethiopian organizations, and INSA compliance.',
};

export default function PrivacyLayout({ children }: { children: ReactNode }): ReactNode {
  return children;
}

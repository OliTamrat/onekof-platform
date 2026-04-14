import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Onekof terms of service. Subscription model, data ownership, and Ethiopian governing law for our project management platform.',
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Onekof & DAPS Analytics — Our Mission',
  description:
    'Onekof is built by DAPS Analytics to close the productivity gap for Ethiopian and East African organizations. Learn about our mission, data sovereignty commitment, and three-tier deployment architecture.',
  openGraph: {
    title: 'About Onekof & DAPS Analytics',
    description: 'The project management platform built for Ethiopian teams. Learn about our mission and the company behind Onekof.',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

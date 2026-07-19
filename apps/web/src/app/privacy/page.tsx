'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#1B1F23] text-white font-sans antialiased">
      <nav className="border-b border-white/[0.08] bg-[#1B1F23]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <ArrowLeft className="h-4 w-4 text-white/60" />
            <img src="/logo-wordmark.png" alt="Onekof" className="h-10" />
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="mb-3 text-[13px] font-medium uppercase tracking-widest text-[#1C8C7D]">Legal</p>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">Privacy Policy</h1>
        <p className="mt-4 text-[14px] text-white/70">Last updated: April 13, 2026</p>

        <div className="mt-10 space-y-8 text-[14px] leading-relaxed text-white/70">
          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">1. Information We Collect</h2>
            <p>When you use Onekof, we collect information you provide directly:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li><strong className="text-white">Account information:</strong> Name, email address, and password when you create an account.</li>
              <li><strong className="text-white">Organization data:</strong> Organization name, team members, projects, tasks, budgets, and documents you create within the platform.</li>
              <li><strong className="text-white">Usage data:</strong> Activity logs, feature usage patterns, and session information for analytics and security.</li>
              <li><strong className="text-white">Device data:</strong> IP address, browser type, and operating system for security and rate limiting.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">2. How We Use Your Information</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>To provide, maintain, and improve the Onekof platform.</li>
              <li>To authenticate your identity and secure your account.</li>
              <li>To enforce multi-tenant data isolation between organizations.</li>
              <li>To send transactional emails (password resets, invitations, notifications).</li>
              <li>To detect and prevent security threats, fraud, and abuse.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">3. Data Sovereignty & Storage</h2>
            <p>Onekof operates a three-tier hosting architecture designed for data sovereignty:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li><strong className="text-white">Tier 1 (Government):</strong> Data stored exclusively within Ethiopian government-controlled infrastructure.</li>
              <li><strong className="text-white">Tier 2 (Private):</strong> Data stored on customer-owned or DAPS Analytics-managed servers within Ethiopia.</li>
              <li><strong className="text-white">Tier 3 (Global Cloud):</strong> Data stored on Vercel (Frankfurt, Germany) and Supabase (EU region), compliant with GDPR.</li>
            </ul>
            <p className="mt-3">Your organization&apos;s hosting tier determines where your data is stored. Data does not flow between tiers.</p>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">4. Data Sharing</h2>
            <p>We do not sell, rent, or trade your personal information. We may share data only in these circumstances:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>With your consent or at your direction.</li>
              <li>With service providers who assist in platform operations (email delivery, error monitoring), bound by data processing agreements.</li>
              <li>To comply with legal obligations, court orders, or government requests.</li>
              <li>To protect the rights, safety, and security of Onekof, our users, and the public.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">5. Security</h2>
            <p>We implement industry-standard security measures including:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>bcrypt password hashing (12 rounds).</li>
              <li>JWT session tokens with HTTP-only, secure cookies.</li>
              <li>Progressive account lockout after failed login attempts.</li>
              <li>Redis-backed rate limiting on all authentication endpoints.</li>
              <li>Admin audit logging with IP tracking.</li>
              <li>GPG-encrypted database backups.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Access and download your personal data.</li>
              <li>Correct inaccurate information.</li>
              <li>Delete your account and associated data.</li>
              <li>Export your organization&apos;s data in standard formats.</li>
              <li>Object to data processing for marketing purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">7. Contact</h2>
            <p>For privacy-related inquiries, contact us at <a href="mailto:privacy@onekof.com" className="text-[#1C8C7D] hover:underline">privacy@onekof.com</a>.</p>
          </section>
        </div>

        <div className="mt-12 border-t border-white/[0.08] pt-8">
          <div className="flex gap-6">
            <Link href="/terms" className="text-[13px] text-[#1C8C7D] hover:underline">Terms of Service</Link>
            <Link href="/cookies" className="text-[13px] text-[#1C8C7D] hover:underline">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#1B1F23] text-white font-sans antialiased">
      <nav className="border-b border-white/[0.08] bg-[#1B1F23]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <ArrowLeft className="h-4 w-4 text-white/60" />
            <img src="/logo-wordmark.png?v=2" alt="Onekof" className="h-14" />
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="mb-3 text-[13px] font-medium uppercase tracking-widest text-[#1C8C7D]">Legal</p>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">Cookie Policy</h1>
        <p className="mt-4 text-[14px] text-white/70">Last updated: April 13, 2026</p>

        <div className="mt-10 space-y-8 text-[14px] leading-relaxed text-white/70">
          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">1. What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences, keep you signed in, and understand how you use the service.</p>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">2. Cookies We Use</h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-white/[0.08]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.03]">
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-white/60">Cookie</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-white/60">Purpose</th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-white/60">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  <tr>
                    <td className="px-4 py-3 text-[13px] font-mono text-white">next-auth.session-token</td>
                    <td className="px-4 py-3 text-[13px]">Keeps you signed in to your account</td>
                    <td className="px-4 py-3 text-[13px]">24 hours</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-[13px] font-mono text-white">onekof-admin-token</td>
                    <td className="px-4 py-3 text-[13px]">Admin panel authentication</td>
                    <td className="px-4 py-3 text-[13px]">8 hours</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-[13px] font-mono text-white">next-auth.csrf-token</td>
                    <td className="px-4 py-3 text-[13px]">Protects against cross-site request forgery</td>
                    <td className="px-4 py-3 text-[13px]">Session</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-[13px] font-mono text-white">theme</td>
                    <td className="px-4 py-3 text-[13px]">Remembers your light/dark mode preference</td>
                    <td className="px-4 py-3 text-[13px]">1 year</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-[13px] font-mono text-white">language</td>
                    <td className="px-4 py-3 text-[13px]">Remembers your language selection</td>
                    <td className="px-4 py-3 text-[13px]">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">3. Essential vs Non-Essential</h2>
            <p><strong className="text-white">All cookies used by Onekof are essential.</strong> We do not use advertising cookies, social media tracking pixels, or third-party analytics cookies. Every cookie listed above is required for the platform to function correctly.</p>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">4. Cookie Security</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Session cookies are set with <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[12px] text-white">HttpOnly</code> flag — they cannot be accessed by JavaScript.</li>
              <li>In production, all cookies use the <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[12px] text-white">Secure</code> flag — they are only sent over HTTPS.</li>
              <li>Cookies are scoped to your organization&apos;s subdomain to prevent cross-tenant access.</li>
              <li><code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[12px] text-white">SameSite=Lax</code> is set on all cookies to prevent CSRF attacks.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">5. Managing Cookies</h2>
            <p>You can delete cookies through your browser settings. However, disabling essential cookies will prevent you from signing in to Onekof. Since we only use essential cookies, there is no opt-out mechanism — all cookies are required for the Service to function.</p>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">6. Contact</h2>
            <p>For questions about our cookie practices, contact us at <a href="mailto:privacy@onekof.com" className="text-[#1C8C7D] hover:underline">privacy@onekof.com</a>.</p>
          </section>
        </div>

        <div className="mt-12 border-t border-white/[0.08] pt-8">
          <div className="flex gap-6">
            <Link href="/privacy" className="text-[13px] text-[#1C8C7D] hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="text-[13px] text-[#1C8C7D] hover:underline">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#1B1F23] text-white font-sans antialiased">
      <nav className="border-b border-white/[0.08] bg-[#1B1F23]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <ArrowLeft className="h-4 w-4 text-white/60" />
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1C8C7D] to-[#156b60]">
              <span className="text-[12px] font-black text-white">O</span>
            </div>
            <span className="text-[15px] font-semibold">Onekof</span>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="mb-3 text-[13px] font-medium uppercase tracking-widest text-[#1C8C7D]">Legal</p>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">Terms of Service</h1>
        <p className="mt-4 text-[14px] text-white/50">Last updated: April 13, 2026</p>

        <div className="mt-10 space-y-8 text-[14px] leading-relaxed text-white/70">
          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">1. Agreement to Terms</h2>
            <p>By accessing or using the Onekof platform (&quot;Service&quot;), you agree to be bound by these Terms of Service. The Service is operated by DAPS Analytics (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these terms.</p>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">2. Description of Service</h2>
            <p>Onekof is a multi-tenant project management platform that provides task management, budget tracking, team collaboration, knowledge management, and AI-powered document processing. The Service is available via cloud subscription (Tier 3) and on-premise deployment (Tier 1/2).</p>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">3. Accounts & Registration</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>You must provide accurate and complete registration information.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must notify us immediately of any unauthorized access to your account.</li>
              <li>One person or entity may not maintain more than one free account.</li>
              <li>You must be at least 18 years old to create an account.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">4. Subscription & Payment</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>The Service is offered on monthly and yearly subscription plans.</li>
              <li>Prices are denominated in Ethiopian Birr (ETB) for domestic customers and USD for international customers.</li>
              <li>Subscriptions auto-renew unless cancelled before the renewal date.</li>
              <li>We may change pricing with 30 days written notice. Existing subscriptions are honored until renewal.</li>
              <li>Refunds are handled on a case-by-case basis within 14 days of payment.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Use the Service for any illegal purpose or in violation of Ethiopian law.</li>
              <li>Attempt to gain unauthorized access to other organizations&apos; data.</li>
              <li>Upload malicious files, scripts, or executables.</li>
              <li>Interfere with the security or performance of the Service.</li>
              <li>Resell, sublicense, or redistribute access to the Service without written consent.</li>
              <li>Reverse-engineer, decompile, or disassemble any part of the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">6. Data Ownership</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li><strong className="text-white/90">Your data is yours.</strong> You retain all rights to the content and data you create in Onekof.</li>
              <li>We do not claim ownership over your projects, tasks, documents, or any organizational data.</li>
              <li>You grant us a limited license to process your data solely to provide the Service.</li>
              <li>Upon account termination, you may export your data. After a 30-day grace period, data is permanently deleted.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">7. Intellectual Property</h2>
            <p>The Onekof platform, including its source code, design, documentation, and trademarks, is the intellectual property of Oli Tamrat Oli (author, moral rights holder) with commercial rights held by DAPS Analytics. All rights are reserved. EIPA copyright registration filed 2026-04-11.</p>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">8. Service Availability</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>We aim for 99.9% uptime on our cloud service (Tier 3).</li>
              <li>On-premise deployments (Tier 1/2) are managed by the customer or their IT provider. Uptime depends on their infrastructure.</li>
              <li>We may perform scheduled maintenance with advance notice.</li>
              <li>We are not liable for downtime caused by factors outside our control.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, DAPS Analytics shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue, data, or business opportunities arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">10. Governing Law</h2>
            <p>These terms are governed by the laws of the Federal Democratic Republic of Ethiopia. Any disputes shall be resolved in the courts of Addis Ababa, Ethiopia.</p>
          </section>

          <section>
            <h2 className="mb-3 text-[17px] font-semibold text-white">11. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:legal@onekof.com" className="text-[#1C8C7D] hover:underline">legal@onekof.com</a>.</p>
          </section>
        </div>

        <div className="mt-12 border-t border-white/[0.08] pt-8">
          <div className="flex gap-6">
            <Link href="/privacy" className="text-[13px] text-[#1C8C7D] hover:underline">Privacy Policy</Link>
            <Link href="/cookies" className="text-[13px] text-[#1C8C7D] hover:underline">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

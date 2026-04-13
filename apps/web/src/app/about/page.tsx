'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Globe, Shield, Zap, Users, Target, Building2 } from 'lucide-react';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#1B1F23] text-white font-sans antialiased">
      {/* Navigation */}
      <nav className="border-b border-white/[0.08] bg-[#1B1F23]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <ArrowLeft className="h-4 w-4 text-white/60" />
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1C8C7D] to-[#156b60]">
              <span className="text-[12px] font-black text-white">O</span>
            </div>
            <span className="text-[15px] font-semibold">Onekof</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/auth/signin" className="rounded-lg border border-white/[0.12] px-4 py-2 text-[13px] text-white/70 transition hover:bg-white/5">
              Sign In
            </Link>
            <Link href="/auth/signup" className="rounded-lg bg-[#1C8C7D] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#1a7d70]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-[13px] font-medium uppercase tracking-widest text-[#1C8C7D]">About Onekof</p>
            <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              Project management,{' '}
              <span className="text-white/60">reimagined for Africa</span>
            </h1>
            <p className="mt-6 text-[16px] leading-relaxed text-white/70 sm:text-[18px]">
              We believe the best project management tools should understand how your teams actually work —
              in your language, your currency, your calendar, on your infrastructure.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="border-t border-white/[0.08] py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="mb-3 text-[13px] font-medium uppercase tracking-widest text-[#1C8C7D]">Our Mission</p>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                Closing the productivity gap
              </h2>
              <p className="mt-6 text-[15px] leading-relaxed text-white/70">
                Ethiopian organizations manage billions of Birr in projects using spreadsheets, WhatsApp groups,
                and paper-based workflows. International project management tools don&apos;t serve this market —
                they require constant internet, store data outside the country, and only speak English.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-white/70">
                Onekof was purpose-built to change that. We deliver enterprise-grade project management that
                runs on your own servers, speaks your language, and works even when the internet doesn&apos;t.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { number: '172', label: 'Application pages', icon: Zap },
                { number: '5', label: 'Languages supported', icon: Globe },
                { number: '132K+', label: 'Lines of code', icon: Target },
                { number: '408MB', label: 'Docker image size', icon: Building2 },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                  <stat.icon className="mb-3 h-5 w-5 text-[#1C8C7D]" />
                  <p className="text-2xl font-bold">{stat.number}</p>
                  <p className="mt-1 text-[12px] text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why We're Different */}
      <section className="border-t border-white/[0.08] py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-[13px] font-medium uppercase tracking-widest text-[#1C8C7D]">Why Onekof</p>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Built different, on purpose
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Globe,
                title: 'Local languages first',
                description: 'Full interface in Amharic, Oromo, Tigrinya, Somali, and English — with proper Ge\'ez script rendering, not machine-translated afterthoughts.',
              },
              {
                icon: Shield,
                title: 'Data sovereignty',
                description: 'Deploy on your own servers in Ethiopia. Government data stays in government infrastructure. No foreign cloud dependency.',
              },
              {
                icon: Zap,
                title: 'Works offline',
                description: 'The entire platform runs from a 408 MB Docker image. No internet needed after installation. Perfect for regional offices with unreliable connectivity.',
              },
              {
                icon: Users,
                title: 'Multi-tenant architecture',
                description: 'One installation serves multiple organizations with complete data isolation. Each organization gets its own subdomain and workspace.',
              },
              {
                icon: Target,
                title: 'Ethiopian business logic',
                description: 'Ethiopian calendar, ETB currency, July fiscal year start, government workflow templates — not retrofitted, but designed from the foundation.',
              },
              {
                icon: Building2,
                title: 'Three-tier deployment',
                description: 'Same software runs on EthioTelecom Cloud (government), private servers (enterprise), and global cloud (diaspora) — zero code changes between tiers.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
                <item.icon className="mb-4 h-6 w-6 text-[#1C8C7D]" />
                <h3 className="mb-2 text-[15px] font-semibold">{item.title}</h3>
                <p className="text-[13px] leading-relaxed text-white/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Team */}
      <section className="border-t border-white/[0.08] py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-[13px] font-medium uppercase tracking-widest text-[#1C8C7D]">Our Team</p>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Built by Ethiopians, for Ethiopia
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-white/70">
              Onekof is built by DABS Analytics — a technology company focused on delivering enterprise
              software solutions for the Ethiopian and East African market. Our team understands the
              unique challenges of operating in this market because we live them every day.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-lg">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1C8C7D] to-[#156b60]">
                <span className="text-xl font-bold text-white">OT</span>
              </div>
              <h3 className="text-[17px] font-semibold">Oli Tamrat Oli</h3>
              <p className="mt-1 text-[13px] text-[#1C8C7D]">Founder & Lead Engineer</p>
              <p className="mt-4 text-[13px] leading-relaxed text-white/60">
                132,000+ lines of production code. From architecture to deployment,
                every line of Onekof is built with a singular focus: making Ethiopian
                teams more productive with tools that respect their sovereignty, language, and workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.08] py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              Ready to transform how your team works?
            </h2>
            <p className="mt-4 text-[15px] text-white/60">
              Start your free trial today. No credit card required.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/signup" className="rounded-lg bg-[#1C8C7D] px-8 py-3 text-[14px] font-medium text-white transition hover:bg-[#1a7d70]">
                Start Free Trial
              </Link>
              <Link href="/#pricing" className="rounded-lg border border-white/[0.12] px-8 py-3 text-[14px] text-white/70 transition hover:bg-white/5">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-8">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="text-[12px] text-white/50">
            &copy; {new Date().getFullYear()} Onekof by DABS Analytics. All rights reserved.
          </p>
          <div className="mt-3 flex justify-center gap-6">
            <Link href="/privacy" className="text-[12px] text-white/50 transition hover:text-white/70">Privacy</Link>
            <Link href="/terms" className="text-[12px] text-white/50 transition hover:text-white/70">Terms</Link>
            <Link href="/cookies" className="text-[12px] text-white/50 transition hover:text-white/70">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

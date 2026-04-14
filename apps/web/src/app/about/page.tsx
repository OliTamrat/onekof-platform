'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/contexts/language-context';
import {
  Globe,
  Shield,
  Zap,
  Users,
  Target,
  Building2,
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
  Sparkles,
  MapPin,
  Layers,
  Heart,
  Lock,
  Cpu,
  CheckCircle2,
} from 'lucide-react';

/* ─── Grain Overlay ─── */
function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

/* ─── Section Divider ─── */
function SectionDivider() {
  return (
    <div className="mx-auto h-px max-w-[1200px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
  );
}

/* ─── Section Label ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2">
      <span className="h-px w-6 bg-[#1C8C7D]" />
      <span className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#2BB5A2]">
        {children}
      </span>
    </div>
  );
}

export default function AboutPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'Product', href: '/#product' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'About', href: '/about' },
  ];

  const differentiators = [
    {
      icon: Globe,
      title: 'Local languages first',
      description:
        "Full interface in Amharic, Oromo, Tigrinya, Somali, and English — with proper Ge'ez script rendering, not machine-translated afterthoughts.",
    },
    {
      icon: Shield,
      title: 'Data sovereignty',
      description:
        'Deploy on your own servers in Ethiopia. Government data stays in government infrastructure. No dependency on foreign cloud providers.',
    },
    {
      icon: Zap,
      title: 'Works offline',
      description:
        'The entire platform ships as a 408 MB Docker image. No internet required after installation — built for regional offices with unreliable connectivity.',
    },
    {
      icon: Users,
      title: 'Multi-tenant architecture',
      description:
        'One installation serves multiple organizations with complete data isolation. Each organization gets its own subdomain and workspace.',
    },
    {
      icon: Target,
      title: 'Ethiopian business logic',
      description:
        'Ethiopian calendar, ETB currency, July fiscal year start, and government workflow templates — designed from the foundation, not retrofitted.',
    },
    {
      icon: Building2,
      title: 'Three-tier deployment',
      description:
        'Same codebase runs on EthioTelecom Cloud, private servers, and global cloud — zero configuration changes between deployment tiers.',
    },
  ];

  const values = [
    {
      icon: Lock,
      title: 'Sovereignty over convenience',
      description:
        'We never trade data control for ease of deployment. If a feature requires your data to leave your infrastructure, we build it differently.',
    },
    {
      icon: MapPin,
      title: 'Local before global',
      description:
        'Ethiopian calendar, Amharic UI, and ETB budgeting are first-class features — not optional add-ons bolted on after the fact.',
    },
    {
      icon: Layers,
      title: 'Simplicity over complexity',
      description:
        'Every screen is designed for a project manager in Addis or Mekele, not a Silicon Valley power user. Clarity is a feature.',
    },
    {
      icon: Heart,
      title: 'Community-driven development',
      description:
        'Our roadmap is shaped by Ethiopian organizations, government feedback, and diaspora users — not investor dashboards.',
    },
  ];

  const stats = [
    { number: '172', label: 'Application pages', icon: Cpu },
    { number: '5', label: 'Languages supported', icon: Globe },
    { number: '132K+', label: 'Lines of code', icon: Zap },
    { number: '408MB', label: 'Docker image size', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-[#0B0E11] font-sans antialiased text-white/85 selection:bg-[#1C8C7D]/20">
      <GrainOverlay />

      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-[#0B0E11]/80 backdrop-blur-2xl backdrop-saturate-150">
        <div className="mx-auto flex h-[64px] max-w-[1200px] items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-[#1C8C7D] to-violet-600 shadow-lg transition-shadow group-hover:shadow-xl">
              <span className="text-sm font-black text-white">O</span>
            </div>
            <span className="text-[16px] font-bold tracking-[-0.01em]">Onekof</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-[14px] font-medium tracking-[0.02em] transition-all hover:text-white ${
                  link.href === '/about' ? 'text-white' : 'text-white/50'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher />
            <Link
              href="/auth/signin"
              className="rounded-full border border-white/[0.08] px-4 py-2 text-[13px] font-medium text-white/50 transition-all hover:border-white/[0.2] hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#1C8C7D] to-[#2BB5A2] px-5 py-2 text-[13px] font-semibold text-white shadow-lg shadow-[#1C8C7D]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#1C8C7D]/30 hover:brightness-110"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                Get Started
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-4 w-4 text-white/80" />
            ) : (
              <Menu className="h-4 w-4 text-white/80" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-white/[0.08] bg-[#0B0E11]/98 backdrop-blur-2xl md:hidden">
            <div className="space-y-1 px-6 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg py-2.5 text-[15px] text-white/70 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t border-white/[0.08] pt-4">
                <Link href="/auth/signin" className="py-2.5 text-[15px] text-white/70">
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1C8C7D] to-[#2BB5A2] px-4 py-2.5 text-center text-[15px] font-semibold text-white shadow-lg"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-40 pb-24 sm:pt-48 sm:pb-32">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-[#1C8C7D]/[0.07] blur-[120px]" />
        <div className="pointer-events-none absolute right-0 top-1/3 h-[300px] w-[400px] bg-violet-500/[0.04] blur-[100px]" />

        <div className="relative mx-auto max-w-[1200px] px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2">
              <Sparkles className="h-3.5 w-3.5 text-[#1C8C7D]" />
              <span className="text-[13px] text-white/60">About Onekof</span>
            </div>

            <h1 className="font-serif text-[clamp(2.5rem,6vw,4.25rem)] font-medium leading-[1.1] tracking-[-0.02em]">
              Project management,{' '}
              <span className="font-serif italic text-[#2BB5A2]">reimagined for Africa</span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-[18px] leading-[1.75] text-white/50">
              We believe the best project management tools should understand how your teams actually
              work — in your language, your currency, your calendar, on your infrastructure.
            </p>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══ MISSION ═══ */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left: text */}
            <div>
              <SectionLabel>Our Mission</SectionLabel>
              <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.15]">
                Closing the productivity gap{' '}
                <span className="font-serif italic text-white/40">for Ethiopian organizations</span>
              </h2>
              <p className="mt-7 text-[16px] leading-[1.8] text-white/50">
                Ethiopian organizations manage billions of Birr in projects using spreadsheets,
                WhatsApp groups, and paper-based workflows. International tools don&apos;t serve
                this market — they require constant internet, store data outside the country, and
                only speak English.
              </p>
              <p className="mt-5 text-[16px] leading-[1.8] text-white/50">
                Onekof was purpose-built to change that. We deliver enterprise-grade project
                management that runs on your own servers, speaks your language, and works even when
                the internet doesn&apos;t.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  'Self-hosted first',
                  'Ethiopian calendar',
                  'ETB budgeting',
                  'Ge\'ez script',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#1C8C7D]/20 bg-[#1C8C7D]/[0.06] px-3.5 py-1.5 text-[12px] font-medium text-[#2BB5A2]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/[0.08] bg-[#12161B] p-7 transition-all duration-300 hover:border-white/[0.15]"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#1C8C7D]/[0.08]">
                    <stat.icon className="h-5 w-5 text-[#1C8C7D]" />
                  </div>
                  <p className="font-serif text-[2.25rem] font-semibold text-[#2BB5A2]">
                    {stat.number}
                  </p>
                  <p className="mt-1 text-[13px] text-white/40">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══ ABOUT DABS ANALYTICS ═══ */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#12161B] p-8 sm:p-12 lg:p-16">
            {/* Background accent */}
            <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] translate-x-1/3 -translate-y-1/3 bg-[#1C8C7D]/[0.05] blur-[100px]" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-[300px] w-[300px] -translate-x-1/3 translate-y-1/3 bg-violet-500/[0.04] blur-[80px]" />

            <div className="relative grid gap-12 lg:grid-cols-2 lg:gap-20">
              <div>
                <SectionLabel>The Company</SectionLabel>
                <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.15]">
                  DABS Analytics —{' '}
                  <span className="font-serif italic text-[#2BB5A2]">
                    software built from Ethiopian roots
                  </span>
                </h2>
                <p className="mt-7 text-[16px] leading-[1.8] text-white/50">
                  DABS Analytics is the company behind Onekof. We were founded with a single
                  mandate: build the software infrastructure that Ethiopian and East African
                  organizations deserve — not adapted from tools designed for other markets, but
                  built from the ground up for ours.
                </p>
                <p className="mt-5 text-[16px] leading-[1.8] text-white/50">
                  Based in Maryland, USA, with Ethiopian roots at our core, we operate at the
                  intersection of diaspora perspective and on-the-ground African reality. We
                  understand both worlds, and we build software that bridges them.
                </p>
              </div>

              <div className="space-y-5">
                {[
                  {
                    icon: Shield,
                    title: 'Not a consulting firm',
                    description:
                      'DABS Analytics is a product company. We build software that scales, not bespoke solutions that disappear when the engagement ends.',
                  },
                  {
                    icon: Lock,
                    title: 'Data sovereignty as doctrine',
                    description:
                      'We design every product feature around the assumption that your data belongs to you — on your servers, under your laws, in your jurisdiction.',
                  },
                  {
                    icon: Globe,
                    title: 'Culturally-aware software',
                    description:
                      'Ethiopian calendar systems, local payment rails, multi-language interfaces, and government workflow patterns are first-class design constraints — not afterthoughts.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-xl border border-white/[0.06] bg-[#181D23] p-5"
                  >
                    <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#1C8C7D]/[0.08]">
                      <item.icon className="h-4 w-4 text-[#1C8C7D]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-white/85">{item.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-white/50">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══ WHY WE'RE DIFFERENT ═══ */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <SectionLabel>Why Onekof</SectionLabel>
            <h2 className="font-serif text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.15]">
              Built different,{' '}
              <span className="font-serif italic text-white/40">on purpose</span>
            </h2>
            <p className="mt-5 text-[17px] leading-[1.75] text-white/50">
              Every design decision in Onekof traces back to a specific failure mode we observed in
              how international tools serve African organizations.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] sm:grid-cols-2 lg:grid-cols-3">
            {differentiators.map((item) => (
              <div
                key={item.title}
                className="group h-full border border-white/[0.03] bg-[#0B0E11] p-7 transition-all duration-500 hover:bg-white/[0.02]"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#1C8C7D]/[0.08] transition-colors duration-300 group-hover:bg-[#1C8C7D]/[0.14]">
                  <item.icon className="h-5 w-5 text-[#1C8C7D] transition-colors duration-300 group-hover:text-[#2BB5A2]" />
                </div>
                <h3 className="mb-2.5 text-[15px] font-semibold text-white/85">{item.title}</h3>
                <p className="text-[13px] leading-relaxed text-white/50">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══ VALUES ═══ */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <SectionLabel>What We Stand For</SectionLabel>
            <h2 className="font-serif text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.15]">
              Values that shape{' '}
              <span className="font-serif italic text-[#2BB5A2]">every line of code</span>
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {values.map((value, i) => (
              <div
                key={value.title}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12161B] p-8 transition-all duration-300 hover:border-white/[0.15]"
              >
                <div className="pointer-events-none absolute right-0 top-0 h-[200px] w-[200px] translate-x-1/2 -translate-y-1/2 bg-[#1C8C7D]/[0.04] blur-[60px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1C8C7D]/[0.08]">
                    <value.icon className="h-5 w-5 text-[#1C8C7D]" />
                  </div>
                  <h3 className="mb-3 font-serif text-[1.2rem] font-medium text-white/85">
                    {value.title}
                  </h3>
                  <p className="text-[14px] leading-[1.8] text-white/50">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══ DEPLOYMENT TIERS ═══ */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <SectionLabel>Deployment</SectionLabel>
            <h2 className="font-serif text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.15]">
              One platform,{' '}
              <span className="font-serif italic text-white/40">three deployment tiers</span>
            </h2>
            <p className="mt-5 text-[17px] leading-[1.75] text-white/50">
              The same Onekof codebase runs across all three tiers. Zero code changes between
              environments.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                tier: 'Tier 1',
                name: 'EthioTelecom Cloud',
                audience: 'Government & public institutions',
                description:
                  'Hosted on sovereign Ethiopian cloud infrastructure. Meets INSA compliance requirements. Data never leaves the country.',
                features: [
                  'INSA-compliant hosting',
                  'Ethiopian data residency',
                  'Government procurement ready',
                  'Air-gap capable',
                ],
                accent: 'from-[#1C8C7D] to-[#2BB5A2]',
                glow: 'bg-[#1C8C7D]',
              },
              {
                tier: 'Tier 2',
                name: 'Private Server',
                audience: 'Enterprise & NGOs',
                description:
                  'Self-hosted on your own infrastructure. Full control over data, backups, and access. Works on a 408 MB Docker image.',
                features: [
                  '408 MB Docker image',
                  'Works fully offline',
                  'Your infrastructure',
                  'Your backup policies',
                ],
                accent: 'from-violet-600 to-purple-500',
                glow: 'bg-violet-500',
              },
              {
                tier: 'Tier 3',
                name: 'Global Cloud',
                audience: 'Diaspora & remote teams',
                description:
                  'Managed hosting for Ethiopian diaspora organizations and distributed teams that need global accessibility without setup overhead.',
                features: [
                  'Zero infrastructure setup',
                  'Global CDN',
                  'Automatic updates',
                  'Usage-based pricing',
                ],
                accent: 'from-amber-500 to-orange-500',
                glow: 'bg-amber-500',
              },
            ].map((tier) => (
              <div
                key={tier.tier}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12161B] p-8 transition-all duration-300 hover:border-white/[0.15]"
              >
                <div
                  className={`pointer-events-none absolute right-0 top-0 h-[200px] w-[200px] translate-x-1/2 -translate-y-1/2 ${tier.glow}/[0.06] blur-[80px]`}
                />
                <div className="relative">
                  <span
                    className={`inline-block rounded-full bg-gradient-to-r ${tier.accent} px-3 py-1 text-[11px] font-bold text-white`}
                  >
                    {tier.tier}
                  </span>
                  <h3 className="mt-4 font-serif text-[1.35rem] font-medium text-white/85">
                    {tier.name}
                  </h3>
                  <p className="mt-1 text-[12px] font-medium text-white/40">{tier.audience}</p>
                  <p className="mt-4 text-[13px] leading-relaxed text-white/50">
                    {tier.description}
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-[13px] text-white/50">
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-[#2BB5A2]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#1C8C7D]/[0.06] to-violet-500/[0.03] px-6 py-16 text-center sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-[#1C8C7D]/[0.08] blur-[80px]" />
            <div className="relative">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2">
                <Sparkles className="h-3.5 w-3.5 text-[#1C8C7D]" />
                <span className="text-[13px] text-white/60">
                  Pre-launch — be among the first
                </span>
              </div>
              <h2 className="font-serif text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.15]">
                Ready to transform how your team works?
                <br />
                <span className="font-serif italic text-[#2BB5A2]">
                  Start free, no credit card required.
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-[560px] text-[18px] leading-[1.7] text-white/50">
                Join organizations across Ethiopia and the diaspora building a better way to work
                together.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/auth/signup"
                  className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#1C8C7D] to-[#2BB5A2] px-8 py-4 text-[15px] font-semibold text-white shadow-xl shadow-[#1C8C7D]/20 transition-all hover:shadow-2xl hover:shadow-[#1C8C7D]/30 hover:brightness-110 active:scale-[0.98] sm:w-auto"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="mailto:hello@onekof.com"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.1] px-8 py-4 text-[15px] font-medium text-white/60 transition-all hover:border-white/[0.2] hover:text-white sm:w-auto"
                >
                  Talk to us
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1200px] px-6 py-14 sm:py-16">
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#1C8C7D] to-violet-600 shadow-lg">
                  <span className="text-[12px] font-black text-white">O</span>
                </div>
                <span className="text-[16px] font-bold">Onekof</span>
              </div>
              <p className="mt-4 max-w-xs text-[14px] leading-[1.7] text-white/50">
                Modern project management built for Ethiopian teams. Native calendar, local
                languages, ETB budgets, and workflows designed for how you actually work.
              </p>
              <div className="mt-6 flex gap-3">
                {[
                  { name: 'Twitter', letter: 'X' },
                  { name: 'LinkedIn', letter: 'in' },
                  { name: 'Telegram', letter: 'T' },
                ].map((social) => (
                  <a
                    key={social.name}
                    href="#"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[11px] font-bold text-white/50 transition-all hover:border-[#1C8C7D]/20 hover:bg-[#1C8C7D]/10 hover:text-[#1C8C7D]"
                  >
                    {social.letter}
                  </a>
                ))}
              </div>
            </div>

            {[
              {
                title: 'Product',
                links: [
                  { label: 'Features', href: '/#features' },
                  { label: 'Pricing', href: '/#pricing' },
                  { label: 'Integrations', href: '#' },
                  { label: 'Changelog', href: '#' },
                  { label: 'Roadmap', href: '#' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { label: 'About', href: '/about' },
                  { label: 'Blog', href: '#' },
                  { label: 'Careers', href: '#' },
                  { label: 'Press', href: '#' },
                  { label: 'Contact', href: 'mailto:hello@onekof.com' },
                ],
              },
              {
                title: 'Resources',
                links: [
                  { label: 'Documentation', href: '#' },
                  { label: 'Help Center', href: '#' },
                  { label: 'API Reference', href: '#' },
                  { label: 'Community', href: '#' },
                  { label: 'Status', href: '#' },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/30">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-[14px] text-white/50 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
            <p className="text-[13px] text-white/30">
              &copy; {new Date().getFullYear()} DABS Analytics. All rights reserved.
            </p>
            <div className="flex gap-6">
              {[
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
                { label: 'Cookies', href: '/cookies' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[13px] text-white/30 transition-colors hover:text-white/50"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

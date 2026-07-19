'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/contexts/language-context';
import {
  ArrowRight,
  ArrowLeft,
  Menu,
  X,
  Layers,
  Kanban,
  Brain,
  Shield,
  BarChart3,
  Zap,
  Maximize2,
  Minimize2,
} from 'lucide-react';

const architectureLayers = [
  {
    number: '0',
    title: 'Foundation',
    description: 'Raw data sync layer. Ingests issues, safety protocols, and ministry records from JIRA and external sources.',
    icon: Shield,
    color: 'from-slate-500 to-slate-400',
  },
  {
    number: '1',
    title: 'Prioritization Engine',
    description: '23 tasks broken by priority — Highest (5), High (4), Medium (12), Low (2). Smart ranking drives what surfaces first.',
    icon: BarChart3,
    color: 'from-orange-500 to-amber-400',
  },
  {
    number: '2',
    title: 'Kanban Frame',
    description: 'Backlog, To Do, In Progress, Done — the structural frame that organizes work into swimlanes.',
    icon: Kanban,
    color: 'from-blue-500 to-cyan-400',
  },
  {
    number: '3',
    title: 'Task Cards',
    description: 'Individual work items with assignees, labels, and metadata. Each card is a unit of delivery.',
    icon: Layers,
    color: 'from-violet-500 to-purple-400',
  },
  {
    number: '4',
    title: 'Issues & Dependencies',
    description: 'Blocker flags, dependency lines, and cross-links between cards. The relationship graph that prevents bottlenecks.',
    icon: Zap,
    color: 'from-red-500 to-rose-400',
  },
  {
    number: '5',
    title: 'Activity Layer',
    description: 'Comments, mentions, avatars, and timeline. The human layer where collaboration happens.',
    icon: BarChart3,
    color: 'from-emerald-500 to-teal-400',
  },
  {
    number: '6',
    title: 'Intelligence Layer',
    description: 'AI-powered search, filtering by Task/Project/Goal/Comment, and smart suggestions. The brain on top.',
    icon: Brain,
    color: 'from-[#1C8C7D] to-[#2BB5A2]',
  },
];

export default function ProductPage() {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const navLinks = [
    { label: t('landing.nav.features'), href: '/#features' },
    { label: t('landing.nav.product'), href: '/product' },
    { label: t('landing.nav.pricing'), href: '/pricing' },
    { label: t('landing.nav.about'), href: '/about' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0E11] font-sans antialiased text-white selection:bg-[#1C8C7D]/20">
      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[100]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-[#0B0E11]/80 backdrop-blur-2xl backdrop-saturate-150">
        <div className="mx-auto flex h-[64px] max-w-[1200px] items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <img src="/logo-mark.png" alt="Onekof" className="h-11 w-11 md:hidden" />
            <img src="/logo-wordmark.png" alt="Onekof" className="h-11 hidden md:block" />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-[14px] font-medium tracking-[0.02em] transition-all hover:text-white ${
                  link.href === '/product' ? 'text-white' : 'text-white/70'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher />
            <Link
              href="/auth/signin"
              className="rounded-full border border-white/[0.08] px-4 py-2 text-[13px] font-medium text-white/70 transition-all hover:border-white/[0.2] hover:text-white"
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
            {mobileOpen ? <X className="h-4 w-4 text-white" /> : <Menu className="h-4 w-4 text-white" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-white/[0.08] bg-[#0B0E11]/95 backdrop-blur-xl md:hidden">
            <div className="space-y-1 px-6 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-[14px] font-medium text-white/70 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-3">
                <Link href="/auth/signin" className="flex-1 rounded-full border border-white/[0.08] py-2.5 text-center text-[13px] font-medium text-white/70">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="flex-1 rounded-full bg-gradient-to-r from-[#1C8C7D] to-[#2BB5A2] py-2.5 text-center text-[13px] font-semibold text-white">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative overflow-hidden pt-28 sm:pt-36">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-[15%] -top-[20%] h-[700px] w-[700px] rounded-full bg-primary-500/[0.08] blur-[120px]" />
          <div className="absolute -left-[10%] bottom-[10%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.05] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-6">
          <Link
            href="/"
            className="group mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[13px] font-medium text-white/70 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Home
          </Link>

          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#1C8C7D]/25 bg-[#1C8C7D]/[0.08] px-3 py-1.5">
              <Layers className="h-3.5 w-3.5 text-[#2BB5A2]" />
              <span className="text-[12px] font-semibold text-[#2BB5A2]">Interactive Architecture</span>
            </div>

            <h1 className="font-serif text-[clamp(2rem,4.5vw,3.75rem)] font-medium leading-[1.1] tracking-[-0.02em]">
              How Onekof PM{' '}
              <span className="bg-gradient-to-r from-[#2BB5A2] to-primary-500 bg-clip-text font-serif italic text-transparent">
                actually works
              </span>
            </h1>

            <p className="mt-5 max-w-[600px] text-[17px] leading-[1.75] text-white/60">
              Seven layers — from raw data ingestion to AI-powered intelligence. Drag the explode slider to pull the stack apart and see how 23 tasks move from data to delivery.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ INTERACTIVE EXPLAINER ═══ */}
      <section className={`relative mt-12 ${isFullscreen ? 'fixed inset-0 z-[200] mt-0 bg-[#0B0E11]' : ''}`}>
        {/* Fullscreen toggle */}
        <div className={`mx-auto flex items-center justify-end gap-3 px-6 pb-4 ${isFullscreen ? 'max-w-none pt-4' : 'max-w-[1200px]'}`}>
          <div className="flex items-center gap-2 text-[12px] text-white/40">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#2BB5A2]" />
            Interactive — drag slider to explore
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12px] font-medium text-white/60 transition-all hover:border-white/[0.15] hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>

        <div className={`mx-auto ${isFullscreen ? 'h-[calc(100vh-48px)] max-w-none px-0' : 'max-w-[1200px] px-6'}`}>
          <div
            className={`overflow-hidden rounded-2xl border border-white/[0.1] bg-[#12161B] shadow-2xl ${
              isFullscreen ? 'h-full rounded-none border-0' : 'aspect-[16/10]'
            }`}
            style={{ boxShadow: isFullscreen ? 'none' : '0 25px 60px rgba(0,0,0,0.4), 0 0 80px rgba(28,140,125,0.06)' }}
          >
            <iframe
              src="/product-explainer.html"
              className="h-full w-full border-0"
              title="Onekof PM Product Explainer"
              allow="fullscreen"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ═══ LAYER BREAKDOWN ═══ */}
      <section className="relative mt-24 pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#1C8C7D]/[0.04] blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-6">
          <div className="mb-16 text-center">
            <h2 className="font-serif text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium leading-[1.15] tracking-[-0.02em]">
              The Seven Layers of{' '}
              <span className="bg-gradient-to-r from-[#2BB5A2] to-primary-500 bg-clip-text text-transparent">
                Onekof PM
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-[520px] text-[16px] leading-relaxed text-white/55">
              Each layer transforms data from the one below. Together they form a complete project management intelligence stack.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {architectureLayers.map((layer) => (
              <div
                key={layer.number}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${layer.color} shadow-lg`}>
                    <layer.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-white/25">
                    Layer {layer.number}
                  </span>
                </div>
                <h3 className="mb-2 text-[16px] font-semibold text-white">
                  {layer.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-white/50">
                  {layer.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <p className="mb-6 text-[15px] text-white/50">
              Ready to see it in action?
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#1C8C7D] to-[#2BB5A2] px-7 py-3.5 text-[15px] font-semibold text-white shadow-xl shadow-[#1C8C7D]/20 transition-all hover:shadow-2xl hover:shadow-[#1C8C7D]/30 hover:brightness-110"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.1] px-7 py-3.5 text-[15px] font-medium text-white/70 transition-all hover:border-white/[0.2] hover:text-white"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/[0.06] bg-[#0B0E11]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-8">
          <div className="flex items-center gap-3">
            <img src="/logo-wordmark.png" alt="Onekof" className="h-9" />
          </div>
          <p className="text-[12px] text-white/30">
            &copy; 2026 DAPS Analytics. Built for Ethiopia.
          </p>
        </div>
      </footer>
    </div>
  );
}

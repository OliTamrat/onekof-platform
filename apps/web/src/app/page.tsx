'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  Globe,
  Zap,
  Users,
  Shield,
  BarChart3,
  Kanban,
  ChevronDown,
  Menu,
  X,
  Target,
  Workflow,
  Languages,
  Check,
  ArrowUpRight,
  Minus,
} from 'lucide-react';

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function Counter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

const features = [
  {
    icon: Calendar,
    title: 'Ethiopian Calendar',
    desc: 'Native Ethiopian calendar with Amharic month names, holiday markers, and seamless Gregorian toggle.',
  },
  {
    icon: Languages,
    title: 'Multi-language',
    desc: 'Full interface in Amharic, Afaan Oromoo, Tigrinya, and English. Every label, notification, and report.',
  },
  {
    icon: Kanban,
    title: 'Multiple views',
    desc: 'Kanban boards, list, timeline, table, and calendar views. Work the way your team prefers.',
  },
  {
    icon: Workflow,
    title: 'Automations',
    desc: 'Build custom workflows without code. Auto-assign, notify, and trigger actions on events.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    desc: 'Velocity, burndown, team performance, and budget dashboards with real-time data.',
  },
  {
    icon: Target,
    title: 'Goals & OKRs',
    desc: 'Set objectives, track key results, and align every project to organizational goals.',
  },
  {
    icon: Zap,
    title: 'Real-time',
    desc: 'Live updates, cursor presence, instant comments, and push notifications across your team.',
  },
  {
    icon: Shield,
    title: 'Enterprise security',
    desc: 'RBAC, two-factor auth, session management, audit logs. SOC 2 ready infrastructure.',
  },
  {
    icon: Globe,
    title: 'ETB budgets',
    desc: 'Track project budgets natively in Ethiopian Birr with expense management and approvals.',
  },
];

const plans = [
  {
    name: 'Free',
    desc: 'For small teams getting started',
    price: 0,
    yearlyPrice: 0,
    features: ['Up to 10 users', '3 projects', 'Kanban & list views', 'Ethiopian calendar', '4 languages', 'Basic reports'],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Pro',
    desc: 'For growing teams that need more',
    price: 2500,
    yearlyPrice: 1999,
    features: ['Unlimited users', 'Unlimited projects', 'All views', 'Automations', 'Budget tracking (ETB)', 'Goals & OKRs', 'Advanced analytics', 'Priority support'],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    desc: 'For large organizations',
    price: null,
    yearlyPrice: null,
    features: ['Everything in Pro', 'SSO & SAML', 'Advanced security', 'Custom integrations', 'Dedicated support', 'SLA guarantee', 'On-premise option', 'Custom training'],
    cta: 'Contact sales',
    highlighted: false,
  },
];

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
  ];

  return (
    <div className="min-h-screen bg-midnight-950 text-white antialiased">
      {/* ═══ NAV ═══ */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-white/[0.06] bg-midnight-950/80 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <span className="text-sm font-black text-midnight-950">O</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight">Onekof</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[13px] text-white/50 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/auth/signin"
              className="text-[13px] text-white/50 transition-colors hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-lg bg-white px-4 py-2 text-[13px] font-medium text-midnight-950 transition-all hover:bg-white/90"
            >
              Get started
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/[0.06] bg-midnight-950/95 backdrop-blur-xl md:hidden">
            <div className="space-y-1 px-6 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2.5 text-[15px] text-white/60 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t border-white/[0.06] pt-4">
                <Link href="/auth/signin" className="py-2.5 text-[15px] text-white/60">
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-lg bg-white px-4 py-2.5 text-center text-[15px] font-medium text-midnight-950"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/[0.07] blur-[120px]" />
          <div className="absolute left-1/4 top-32 h-[300px] w-[300px] rounded-full bg-purple-600/[0.05] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-36 text-center sm:pt-44 lg:pt-52">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[13px] text-white/50">Built for Ethiopian teams</span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-[clamp(2.25rem,6vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.035em]">
              Project management
              <br />
              <span className="text-white/40">that speaks your language</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-white/40">
              Tasks, boards, calendars, budgets, and analytics in one workspace.
              Native Ethiopian calendar, Amharic, Oromoo, and Tigrinya built in.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-[14px] font-medium text-midnight-950 transition-all hover:bg-white/90"
              >
                Start for free
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] px-6 py-3 text-[14px] font-medium text-white/60 transition-all hover:border-white/[0.2] hover:text-white"
              >
                See features
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-12 flex items-center justify-center gap-6">
              {['Free forever for small teams', 'No credit card required'].map((text) => (
                <span key={text} className="flex items-center gap-1.5 text-[13px] text-white/30">
                  <Check className="h-3.5 w-3.5" />
                  {text}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Product preview */}
        <Reveal delay={400}>
          <div className="relative mx-auto max-w-6xl px-6 pb-32">
            <div className="absolute -inset-4 rounded-2xl bg-brand-500/[0.06] blur-3xl" />
            <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-midnight-900/80 shadow-2xl shadow-black/50">
              {/* Window chrome */}
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-white/[0.15]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/[0.15]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/[0.15]" />
                </div>
                <div className="mx-auto flex h-6 w-64 items-center justify-center rounded-md bg-white/[0.05] text-[11px] text-white/20">
                  app.onekof.com
                </div>
              </div>

              {/* Dashboard mockup */}
              <div className="flex min-h-[420px] sm:min-h-[480px]">
                {/* Sidebar */}
                <div className="hidden w-52 border-r border-white/[0.06] bg-midnight-950/50 p-4 lg:block">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-brand-600 text-center text-[10px] font-bold leading-6">T</div>
                    <span className="text-[12px] font-medium text-white/70">TechEth Solutions</span>
                  </div>
                  {['Dashboard', 'Projects', 'Calendar', 'Team', 'Reports'].map((item, i) => (
                    <div
                      key={item}
                      className={`mb-1 rounded-md px-3 py-2 text-[12px] ${
                        i === 1 ? 'bg-white/[0.06] font-medium text-white' : 'text-white/30'
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 p-5 sm:p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-[13px] font-medium text-white/80">Sprint 14</h3>
                      <p className="text-[11px] text-white/30">መጋቢት 1 - 15, 2017</p>
                    </div>
                    <div className="flex gap-2">
                      {['Board', 'List', 'Calendar'].map((v, i) => (
                        <div
                          key={v}
                          className={`rounded-md px-3 py-1.5 text-[11px] ${
                            i === 0 ? 'bg-white/[0.08] font-medium text-white/70' : 'text-white/25'
                          }`}
                        >
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kanban columns */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: 'Backlog', count: 5, color: 'bg-white/20', cards: ['Setup CI pipeline', 'Design tokens'] },
                      { label: 'In Progress', count: 3, color: 'bg-brand-500', cards: ['User auth flow', 'API endpoints'] },
                      { label: 'Review', count: 2, color: 'bg-amber-500', cards: ['Dashboard UI'] },
                      { label: 'Done', count: 8, color: 'bg-emerald-500', cards: ['DB schema', 'Login page'] },
                    ].map((col) => (
                      <div key={col.label}>
                        <div className="mb-2.5 flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full ${col.color}`} />
                          <span className="text-[11px] font-medium text-white/50">{col.label}</span>
                          <span className="text-[10px] text-white/20">{col.count}</span>
                        </div>
                        <div className="space-y-2">
                          {col.cards.map((card) => (
                            <div key={card} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
                              <p className="text-[11px] text-white/60">{card}</p>
                              <div className="mt-2 flex items-center justify-between">
                                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-brand-400 to-purple-400" />
                                <span className="text-[9px] text-white/20">መጋ 8</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ LOGOS ═══ */}
      <section className="border-y border-white/[0.06] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-8 text-center text-[13px] text-white/25">Trusted by teams across Ethiopia</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {['TechEth', 'AddisDev', 'BuildEth', 'HabeshaFin', 'EthioCloud', 'NileTech'].map((name) => (
              <span key={name} className="text-[15px] font-semibold tracking-wide text-white/[0.12]">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto mb-20 max-w-2xl text-center">
              <p className="mb-3 text-[13px] font-medium text-brand-400">Features</p>
              <h2 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                Everything you need.
                <br />
                <span className="text-white/40">Nothing you don&apos;t.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 50}>
                <div className="group border border-white/[0.03] bg-midnight-950 p-8 transition-colors hover:bg-white/[0.02]">
                  <feature.icon className="mb-4 h-5 w-5 text-white/30 transition-colors group-hover:text-brand-400" />
                  <h3 className="mb-2 text-[15px] font-medium">{feature.title}</h3>
                  <p className="text-[14px] leading-relaxed text-white/35">{feature.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRODUCT SHOWCASE ═══ */}
      <section className="border-y border-white/[0.06] py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <Reveal>
              <div>
                <p className="mb-3 text-[13px] font-medium text-brand-400">Ethiopian-first</p>
                <h2 className="mb-5 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                  Built for how you
                  <br />
                  <span className="text-white/40">actually work</span>
                </h2>
                <p className="mb-8 text-[16px] leading-relaxed text-white/35">
                  Not another foreign tool with a language pack. Onekof is engineered
                  from the ground up for Ethiopian workflows, calendars, and languages.
                </p>

                <div className="space-y-5">
                  {[
                    { title: 'Ethiopian Calendar', desc: 'Plan sprints in Meskerem. Track deadlines in Pagume. Toggle Gregorian seamlessly.' },
                    { title: 'Multi-language UI', desc: 'Full Amharic, Oromoo, and Tigrinya — not machine-translated, human-written.' },
                    { title: 'ETB Budget Tracking', desc: 'Native Birr support with expense approvals and financial reporting.' },
                  ].map((item, i) => (
                    <div key={item.title} className="flex gap-4">
                      <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04]">
                        <span className="text-[11px] font-medium text-white/50">{i + 1}</span>
                      </div>
                      <div>
                        <h4 className="mb-1 text-[14px] font-medium">{item.title}</h4>
                        <p className="text-[13px] leading-relaxed text-white/35">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/auth/signup"
                  className="group mt-8 inline-flex items-center gap-2 text-[14px] font-medium text-brand-400 transition-colors hover:text-brand-300"
                >
                  Try it free
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="rounded-xl border border-white/[0.08] bg-midnight-900/50 p-5">
                {/* Ethiopian calendar preview */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-white/60">መጋቢት 2017</span>
                  <div className="flex gap-1">
                    <button className="rounded p-1 text-white/20 hover:bg-white/[0.05]">
                      <ChevronDown className="h-3.5 w-3.5 rotate-90" />
                    </button>
                    <button className="rounded p-1 text-white/20 hover:bg-white/[0.05]">
                      <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {['ሰ', 'ማ', 'ረ', 'ሐ', 'አ', 'ቅ', 'እ'].map((d) => (
                    <div key={d} className="py-2 text-center text-[11px] font-medium text-white/25">{d}</div>
                  ))}
                  {Array.from({ length: 30 }, (_, i) => (
                    <div
                      key={i}
                      className={`flex h-9 items-center justify-center rounded-md text-[12px] transition-colors ${
                        i === 5
                          ? 'bg-brand-600 font-medium text-white'
                          : i === 14
                          ? 'bg-red-500/10 text-red-400'
                          : i === 22
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'text-white/40 hover:bg-white/[0.04]'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 rounded-md bg-brand-600/10 px-3 py-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                    <span className="text-[11px] text-brand-300">Sprint 14 starts</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-red-500/10 px-3 py-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    <span className="text-[11px] text-red-300">API deadline</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              { value: 500, suffix: '+', label: 'Teams onboarded' },
              { value: 40, suffix: '%', label: 'Faster delivery' },
              { value: 99, suffix: '.9%', label: 'Uptime' },
              { value: 4, suffix: '', label: 'Languages' },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 80}>
                <div className="text-center">
                  <div className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    <Counter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-2 text-[13px] text-white/30">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="about" className="border-y border-white/[0.06] py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-3 text-[13px] font-medium text-brand-400">Testimonials</p>
              <h2 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                Loved by teams who&apos;ve
                <br />
                <span className="text-white/40">tried everything else</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote: 'We tried Jira, Trello, and Asana. None of them understood Ethiopian workflows. Onekof\'s calendar integration alone saved us hours every week.',
                name: 'Abebe Kebede',
                role: 'CTO, TechEth Solutions',
              },
              {
                quote: 'Finally, a project management tool our entire team can use — including those who are most comfortable in Amharic. The language support is flawless.',
                name: 'Tigist Haile',
                role: 'PM, Addis Development',
              },
              {
                quote: 'The budget tracking in ETB with approval workflows eliminated our spreadsheet chaos. Real-time visibility into every project\'s financial health.',
                name: 'Dawit Tesfaye',
                role: 'Finance Director, BuildEth',
              },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 80}>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:bg-white/[0.03]">
                  <p className="mb-6 text-[14px] leading-relaxed text-white/45">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-[12px] font-medium text-white/50">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium">{t.name}</p>
                      <p className="text-[12px] text-white/30">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-3 text-[13px] font-medium text-brand-400">Pricing</p>
              <h2 className="mb-4 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="text-[16px] text-white/35">
                Start free. Upgrade when you&apos;re ready.
              </p>

              <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
                <button
                  onClick={() => setBilling('monthly')}
                  className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                    billing === 'monthly' ? 'bg-white text-midnight-950' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling('yearly')}
                  className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                    billing === 'yearly' ? 'bg-white text-midnight-950' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  Yearly
                  {billing !== 'yearly' && <span className="ml-1.5 text-[11px] text-emerald-400">-20%</span>}
                </button>
              </div>
            </div>
          </Reveal>

          <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-3">
            {plans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 80}>
                <div
                  className={`relative rounded-xl border p-7 transition-colors ${
                    plan.highlighted
                      ? 'border-brand-500/30 bg-brand-600/[0.06]'
                      : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.03]'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-medium">
                      Popular
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="text-[15px] font-medium">{plan.name}</h3>
                    <p className="mt-1 text-[13px] text-white/30">{plan.desc}</p>
                  </div>

                  <div className="mb-6">
                    {plan.price !== null ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-semibold tracking-tight">
                          {(billing === 'yearly' ? plan.yearlyPrice : plan.price)?.toLocaleString()}
                        </span>
                        <span className="text-[13px] text-white/30">ETB/user/mo</span>
                      </div>
                    ) : (
                      <div className="text-3xl font-semibold tracking-tight">Custom</div>
                    )}
                  </div>

                  <Link
                    href={plan.name === 'Enterprise' ? '#contact' : '/auth/signup'}
                    className={`mb-7 block rounded-lg py-2.5 text-center text-[13px] font-medium transition-all ${
                      plan.highlighted
                        ? 'bg-white text-midnight-950 hover:bg-white/90'
                        : 'border border-white/[0.1] text-white/60 hover:border-white/[0.2] hover:text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-[13px] text-white/40">
                        <Check className="h-3.5 w-3.5 flex-shrink-0 text-white/20" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMPARISON ═══ */}
      <section className="border-y border-white/[0.06] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h3 className="mb-10 text-center text-xl font-semibold tracking-[-0.01em]">
              Why teams switch to Onekof
            </h3>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { from: 'Jira', reasons: ['No Ethiopian calendar', 'English-only interface', 'Overly complex'] },
              { from: 'Trello', reasons: ['No budget tracking', 'Limited reporting', 'No automations'] },
              { from: 'Spreadsheets', reasons: ['No real-time collab', 'No task dependencies', 'Manual tracking'] },
            ].map((item, i) => (
              <Reveal key={item.from} delay={i * 80}>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-colors hover:bg-white/[0.03]">
                  <p className="mb-4 text-[13px] font-medium">
                    Switching from <span className="text-brand-400">{item.from}</span>?
                  </p>
                  <ul className="space-y-2">
                    {item.reasons.map((r) => (
                      <li key={r} className="flex items-center gap-2 text-[13px] text-white/30">
                        <Minus className="h-3 w-3 flex-shrink-0 text-white/15" />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 border-t border-white/[0.06] pt-4">
                    <p className="flex items-center gap-2 text-[13px] font-medium text-brand-400">
                      <Check className="h-3.5 w-3.5" />
                      Onekof handles all of this
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-28 sm:py-36">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
              Ready to ship faster?
            </h2>
            <p className="mt-4 text-[16px] text-white/35">
              Join hundreds of Ethiopian teams already using Onekof to deliver projects on time.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-[14px] font-medium text-midnight-950 transition-all hover:bg-white/90"
              >
                Get started for free
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="mailto:hello@onekof.com"
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] px-7 py-3.5 text-[14px] font-medium text-white/50 transition-all hover:border-white/[0.2] hover:text-white"
              >
                Talk to sales
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white">
                  <span className="text-[11px] font-black text-midnight-950">O</span>
                </div>
                <span className="text-[14px] font-semibold">Onekof</span>
              </div>
              <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/25">
                Modern project management built for Ethiopian teams. Native calendar, local languages,
                and workflows designed for how you actually work.
              </p>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'Changelog'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Resources', links: ['Documentation', 'Help Center', 'API', 'Status'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-[12px] font-medium uppercase tracking-wider text-white/25">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-[13px] text-white/30 transition-colors hover:text-white/60">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
            <p className="text-[12px] text-white/20">
              &copy; {new Date().getFullYear()} Onekof. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Cookies'].map((link) => (
                <a key={link} href="#" className="text-[12px] text-white/20 transition-colors hover:text-white/40">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

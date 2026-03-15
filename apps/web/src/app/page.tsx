'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
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
  Play,
  Star,
  Sparkles,
  ChevronRight,
  Check,
  Building2,
  Layers,
  PieChart,
  TrendingUp,
  Timer,
  Bot,
  Headphones,
  Crown,
  Gem,
} from 'lucide-react';

/* ─────────────────── Intersection Observer Hook ─────────────────── */
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

/* ─────────────────── Animated Counter ─────────────────── */
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
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─────────────────── Section Reveal Wrapper ─────────────────── */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─────────────────── MAIN PAGE ─────────────────── */
export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activePricing, setActivePricing] = useState<'monthly' | 'yearly'>('yearly');

  const languageMap: Record<string, string> = { en: 'English', am: 'አማርኛ', om: 'Afaan Oromoo', ti: 'ትግርኛ' };
  const getCurrentLocale = () => {
    if (typeof document !== 'undefined') {
      const m = document.cookie.match(/NEXT_LOCALE=(\w+)/);
      return m ? m[1] : 'en';
    }
    return 'en';
  };
  const [selectedLang, setSelectedLang] = useState(() => languageMap[getCurrentLocale()] || 'English');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActiveTab((t) => (t + 1) % 4), 5000);
    return () => clearInterval(timer);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Product', href: '#product' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
  ];

  const productTabs = [
    {
      label: 'Board View',
      icon: Kanban,
      content: {
        title: 'Visualize work with Kanban boards',
        desc: 'Drag and drop tasks through custom workflows. See progress at a glance with cards that show assignees, priorities, labels, and due dates.',
      },
    },
    {
      label: 'Ethiopian Calendar',
      icon: Calendar,
      content: {
        title: 'Plan in the calendar you actually use',
        desc: 'Full Ethiopian calendar integration with Amharic month names, holiday markers, and deadline tracking. Toggle between Ethiopian and Gregorian seamlessly.',
      },
    },
    {
      label: 'Automation',
      icon: Workflow,
      content: {
        title: 'Automate repetitive work',
        desc: 'Create powerful automations with a visual builder. When a task moves to "In Review", assign reviewers automatically. When a sprint ends, generate reports instantly.',
      },
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      content: {
        title: 'Real-time project insights',
        desc: 'Track velocity, burndown charts, team performance, and budget utilization with live dashboards. Export reports in PDF or share with stakeholders directly.',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? 'border-b border-brand-100/60 bg-white/90 backdrop-blur-2xl shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 shadow-brand-sm">
                <span className="text-sm font-black text-white tracking-tight">O</span>
              </div>
              <span className={`text-lg font-bold ${scrolled ? 'text-midnight-800' : 'text-white'}`}>Onekof</span>
            </Link>
            <div className="hidden items-center gap-1 lg:flex">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                    scrolled
                      ? 'text-midnight-400 hover:bg-brand-50 hover:text-brand-600'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all ${
                  scrolled
                    ? 'text-midnight-400 hover:bg-brand-50 hover:text-brand-600'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span className="hidden md:inline">{selectedLang}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1.5 w-44 rounded-xl border border-brand-100 bg-white py-1 shadow-xl shadow-brand-900/10">
                    {Object.entries(languageMap).map(([code, name]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setSelectedLang(name);
                          setLangOpen(false);
                          document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000;samesite=lax`;
                          window.location.reload();
                        }}
                        className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors ${
                          selectedLang === name ? 'bg-brand-50 font-semibold text-brand-600' : 'text-midnight-600 hover:bg-surface-100'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Link
              href="/auth/signin"
              className={`hidden rounded-lg px-4 py-2 text-sm font-medium transition-all sm:inline-flex ${
                scrolled
                  ? 'text-midnight-500 hover:bg-brand-50 hover:text-brand-600'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-brand-sm transition-all hover:shadow-brand-md hover:brightness-110 active:scale-[0.98]"
            >
              Get started free
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`ml-1 rounded-lg p-2 lg:hidden ${scrolled ? 'text-midnight-600 hover:bg-brand-50' : 'text-white/80 hover:bg-white/10'}`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="border-t border-brand-100 bg-white lg:hidden">
            <div className="mx-auto max-w-7xl space-y-1 px-5 py-4">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-midnight-600 hover:bg-brand-50"
                >
                  {item.label}
                </a>
              ))}
              <div className="border-t border-brand-100 pt-3">
                <Link href="/auth/signin" className="block rounded-lg px-4 py-3 text-sm font-medium text-midnight-600 hover:bg-brand-50">
                  Log in
                </Link>
                <Link href="/auth/signup" className="mt-1 block rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-4 py-3 text-center text-sm font-semibold text-white">
                  Get started free
                </Link>
              </div>
              <div className="border-t border-brand-100 pt-3">
                <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wider text-midnight-300">Language</p>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(languageMap).map(([code, name]) => (
                    <button
                      key={code}
                      onClick={() => {
                        setSelectedLang(name);
                        document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000;samesite=lax`;
                        window.location.reload();
                      }}
                      className={`rounded-lg px-3 py-2 text-sm ${selectedLang === name ? 'bg-brand-50 font-semibold text-brand-600' : 'text-midnight-500 hover:bg-surface-100'}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="relative overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-midnight-900 via-midnight-800 to-brand-950" />
        {/* Animated gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-brand-600/20 blur-[120px] animate-pulse-slow" />
          <div className="absolute -right-40 top-40 h-[400px] w-[400px] rounded-full bg-purple-600/15 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/10 blur-[100px]" />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="pb-16 pt-28 text-center sm:pt-36 lg:pt-44">
            {/* Badge */}
            <Reveal>
              <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 backdrop-blur-sm">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-accent-coral to-accent-gold">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-medium text-brand-200">
                  The #1 project management tool built for Ethiopia
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-brand-400" />
              </div>
            </Reveal>

            {/* Headline */}
            <Reveal delay={100}>
              <h1 className="mx-auto max-w-5xl text-4xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                One powerful platform to{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-brand-300 bg-clip-text text-transparent">
                    ship faster
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                    <path d="M2 6C50 2 150 2 198 6" stroke="url(#underline-gradient)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                    <defs>
                      <linearGradient id="underline-gradient" x1="0" y1="0" x2="200" y2="0">
                        <stop offset="0%" stopColor="#818CF8" />
                        <stop offset="100%" stopColor="#A78BFA" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>
            </Reveal>

            {/* Subheading */}
            <Reveal delay={200}>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-midnight-200 sm:text-xl">
                Projects, tasks, goals, budgets, docs, and dashboards — all in one workspace.
                Built natively for Ethiopian teams with the calendar, languages, and workflows you need.
              </p>
            </Reveal>

            {/* CTA Row */}
            <Reveal delay={300}>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/auth/signup"
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-brand-lg transition-all hover:shadow-brand-xl hover:brightness-110 active:scale-[0.98]"
                >
                  Get started — it&apos;s free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#product"
                  className="group inline-flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.06] px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/10"
                >
                  <Play className="h-4 w-4 text-brand-400" />
                  Watch demo
                </a>
              </div>
            </Reveal>

            {/* Trust signals */}
            <Reveal delay={400}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                {[
                  'Free forever for small teams',
                  'No credit card required',
                  'Setup in 2 minutes',
                ].map((text) => (
                  <span key={text} className="flex items-center gap-1.5 text-sm text-midnight-300">
                    <CheckCircle2 className="h-4 w-4 text-brand-400/60" />
                    {text}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* ─── Product Screenshot ─── */}
          <Reveal delay={500}>
            <div className="relative mx-auto max-w-6xl pb-20">
              {/* Glow effect */}
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-b from-brand-500/15 via-purple-500/10 to-transparent blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-midnight-800/50 shadow-2xl shadow-black/40 ring-1 ring-white/5 backdrop-blur-sm">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 border-b border-white/5 bg-midnight-800/80 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                    <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                    <div className="h-3 w-3 rounded-full bg-[#27CA40]" />
                  </div>
                  <div className="ml-3 flex-1 rounded-lg bg-midnight-700/60 px-4 py-1.5 text-xs text-midnight-300 border border-white/5">
                    <span className="text-midnight-500">https://</span>app.onekof.com/dashboard
                  </div>
                </div>

                {/* Dashboard Preview */}
                <div className="bg-midnight-900 p-0.5">
                  <div className="flex min-h-[420px] sm:min-h-[480px]">
                    {/* Sidebar */}
                    <div className="hidden w-52 flex-shrink-0 border-r border-white/5 bg-midnight-800/60 p-4 lg:block">
                      <div className="mb-6 flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 shadow-brand-sm">
                          <span className="text-xs font-black text-white">O</span>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-white">Onekof</span>
                          <p className="text-[10px] text-brand-400">Professional</p>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        {[
                          { name: 'Dashboard', active: true, emoji: '📊' },
                          { name: 'Projects', active: false, emoji: '📁' },
                          { name: 'Issues', active: false, emoji: '🎯' },
                          { name: 'Teams', active: false, emoji: '👥' },
                          { name: 'Goals', active: false, emoji: '🏆' },
                          { name: 'Calendar', active: false, emoji: '📅' },
                          { name: 'Budgets', active: false, emoji: '💰' },
                          { name: 'Reports', active: false, emoji: '📈' },
                        ].map((item) => (
                          <div
                            key={item.name}
                            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                              item.active
                                ? 'bg-brand-600/15 text-brand-400'
                                : 'text-midnight-300 hover:bg-white/5 hover:text-midnight-100'
                            }`}
                          >
                            <span className="text-sm">{item.emoji}</span>
                            {item.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-4 sm:p-5">
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-white">Sprint Dashboard</h3>
                          <p className="mt-0.5 text-xs text-midnight-300">መጋቢት 2017 E.C. &middot; Sprint 12</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="hidden items-center gap-1 rounded-lg bg-white/5 px-2 py-1 sm:flex">
                            {['Board', 'List', 'Timeline'].map((v, i) => (
                              <button
                                key={v}
                                className={`rounded-md px-2.5 py-1 text-[10px] font-medium ${
                                  i === 0 ? 'bg-brand-600 text-white' : 'text-midnight-400 hover:text-midnight-200'
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                          <button className="rounded-lg bg-gradient-to-r from-brand-600 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-brand-sm">
                            + New Issue
                          </button>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                        {[
                          { label: 'Total Tasks', value: '47', change: '+5', color: 'text-white', bg: 'bg-white/5' },
                          { label: 'Completed', value: '24', change: '51%', color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
                          { label: 'In Progress', value: '11', change: '', color: 'text-brand-400', bg: 'bg-brand-500/5' },
                          { label: 'Due Today', value: '3', change: '', color: 'text-amber-400', bg: 'bg-amber-500/5' },
                        ].map((stat) => (
                          <div key={stat.label} className={`rounded-xl ${stat.bg} border border-white/5 p-3`}>
                            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <span className="text-[10px] text-midnight-400">{stat.label}</span>
                              {stat.change && (
                                <span className="text-[10px] font-medium text-emerald-400">{stat.change}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Kanban Columns */}
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                        {[
                          {
                            title: 'Backlog',
                            color: 'bg-midnight-400',
                            count: 6,
                            tasks: [
                              { name: 'Payment gateway integration', tag: 'Backend', tagBg: 'bg-purple-500/15 text-purple-400', priority: 'high' },
                              { name: 'የተጠቃሚ ፕሮፋይል ገጽ', tag: 'Frontend', tagBg: 'bg-brand-500/15 text-brand-400', priority: 'med' },
                            ],
                          },
                          {
                            title: 'To Do',
                            color: 'bg-amber-500',
                            count: 4,
                            tasks: [
                              { name: 'Multi-language support', tag: 'i18n', tagBg: 'bg-cyan-500/15 text-cyan-400', priority: 'high' },
                            ],
                          },
                          {
                            title: 'In Progress',
                            color: 'bg-brand-500',
                            count: 3,
                            tasks: [
                              { name: 'Calendar component', tag: '67%', tagBg: 'bg-brand-500/15 text-brand-400', progress: 67, priority: 'high' },
                            ],
                          },
                          {
                            title: 'Done',
                            color: 'bg-emerald-500',
                            count: 8,
                            tasks: [
                              { name: 'Database schema', tag: 'Complete', tagBg: 'bg-emerald-500/15 text-emerald-400', priority: 'done' },
                            ],
                          },
                        ].map((col) => (
                          <div key={col.title} className="rounded-xl bg-white/[0.03] border border-white/5 p-2.5">
                            <div className="mb-2 flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${col.color}`} />
                              <span className="text-[11px] font-semibold text-midnight-100">{col.title}</span>
                              <span className="ml-auto rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] text-midnight-400">{col.count}</span>
                            </div>
                            <div className="space-y-1.5">
                              {col.tasks.map((task) => (
                                <div key={task.name} className="rounded-lg border border-white/5 bg-midnight-800/60 p-2.5 transition-colors hover:bg-midnight-700/60">
                                  <div className="mb-1.5 flex items-start justify-between gap-1">
                                    <span className="text-[11px] font-medium leading-snug text-midnight-100">{task.name}</span>
                                    <div className={`mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                                      task.priority === 'high' ? 'bg-red-400' : task.priority === 'med' ? 'bg-amber-400' : 'bg-emerald-400'
                                    }`} />
                                  </div>
                                  {task.progress !== undefined && (
                                    <div className="mb-1.5 h-1 w-full overflow-hidden rounded-full bg-white/5">
                                      <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500" style={{ width: `${task.progress}%` }} />
                                    </div>
                                  )}
                                  <span className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-medium ${task.tagBg}`}>
                                    {task.tag}
                                  </span>
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
              {/* Floating cards */}
              <div className="absolute -left-4 bottom-32 hidden animate-float rounded-xl border border-brand-200/30 bg-white p-3 shadow-brand-md lg:block">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-midnight-800">Task completed</p>
                    <p className="text-[10px] text-midnight-400">Payment integration done</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 top-40 hidden animate-float-delayed rounded-xl border border-brand-200/30 bg-white p-3 shadow-brand-md lg:block">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50">
                    <Users className="h-4 w-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-midnight-800">3 members online</p>
                    <p className="text-[10px] text-midnight-400">Collaborating in real-time</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ LOGOS / SOCIAL PROOF ═══════════════════ */}
      <section className="border-b border-surface-200 bg-surface-50 py-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-midnight-300">
            Trusted by teams across Ethiopia
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 sm:gap-x-16">
            {[
              { name: 'Ethio Telecom', abbr: 'ET' },
              { name: 'Commercial Bank of Ethiopia', abbr: 'CBE' },
              { name: 'Ethiopian Airlines', abbr: 'EA' },
              { name: 'Safaricom Ethiopia', abbr: 'SE' },
              { name: 'Awash Bank', abbr: 'AB' },
              { name: 'BGI Ethiopia', abbr: 'BGI' },
            ].map((co) => (
              <div key={co.name} className="group flex items-center gap-2 text-midnight-200 transition-all hover:text-midnight-500">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-200 transition-all group-hover:bg-brand-50 group-hover:shadow-brand-sm">
                  <span className="text-sm font-bold text-midnight-300 transition-colors group-hover:text-brand-600">
                    {co.abbr}
                  </span>
                </div>
                <span className="hidden text-xs font-medium text-midnight-300 transition-colors group-hover:text-midnight-600 sm:inline">
                  {co.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES BENTO GRID ═══════════════════ */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5 border border-brand-100">
                <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">Features</span>
              </div>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-midnight-800 sm:text-4xl lg:text-5xl">
                Everything your team needs.{' '}
                <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">Nothing it doesn&apos;t.</span>
              </h2>
              <p className="text-lg text-midnight-400">
                Purpose-built for Ethiopian organizations with features you won&apos;t find in any other tool.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Large card - Ethiopian Calendar */}
            <Reveal delay={100} className="sm:col-span-2 lg:col-span-2">
              <div className="group relative overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 via-surface-50 to-white p-8 transition-all hover:border-brand-200 hover:shadow-brand-md">
                <div className="relative z-10">
                  <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 p-3 shadow-brand-sm">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-midnight-800">Ethiopian Calendar Integration</h3>
                  <p className="max-w-md text-sm leading-relaxed text-midnight-400">
                    The only project management tool with native Ethiopian calendar support. Plan sprints around Pagume, set deadlines in Meskerem, and track milestones the way you think about time.
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 hidden rounded-2xl border border-brand-100 bg-white p-4 shadow-brand-md opacity-80 transition-all group-hover:opacity-100 sm:block">
                  <div className="mb-2 text-center text-xs font-semibold text-midnight-600">መጋቢት 2017</div>
                  <div className="grid grid-cols-7 gap-1">
                    {['ሰ', 'ማ', 'ረ', 'ሐ', 'አ', 'ቅ', 'እ'].map((d) => (
                      <div key={d} className="text-center text-[9px] font-medium text-midnight-300">{d}</div>
                    ))}
                    {Array.from({ length: 30 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-5 w-5 rounded text-center text-[9px] leading-5 ${
                          i === 13 ? 'bg-brand-600 font-bold text-white' : i === 20 ? 'bg-accent-50 font-medium text-accent-600' : 'text-midnight-500 hover:bg-brand-50'
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Languages */}
            <Reveal delay={200}>
              <div className="group rounded-2xl border border-surface-300 bg-white p-8 transition-all hover:border-brand-200 hover:shadow-brand-md">
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-3 shadow-sm">
                  <Languages className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-midnight-800">4 Native Languages</h3>
                <p className="text-sm leading-relaxed text-midnight-400">
                  Full interface in Amharic, Afaan Oromoo, Tigrinya, and English. Every label, button, and notification.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {['English', 'አማርኛ', 'Oromoo', 'ትግርኛ'].map((l) => (
                    <span key={l} className="rounded-full bg-brand-50 border border-brand-100 px-2.5 py-1 text-[10px] font-medium text-brand-700">{l}</span>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Kanban */}
            <Reveal delay={150}>
              <div className="group rounded-2xl border border-surface-300 bg-white p-8 transition-all hover:border-brand-200 hover:shadow-brand-md">
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-3 shadow-sm">
                  <Kanban className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-midnight-800">Multiple Views</h3>
                <p className="text-sm leading-relaxed text-midnight-400">
                  Kanban boards, list view, timeline, and table view. Work the way your team thinks best.
                </p>
              </div>
            </Reveal>

            {/* Automation - Large */}
            <Reveal delay={250} className="sm:col-span-2">
              <div className="group relative overflow-hidden rounded-2xl border border-surface-300 bg-gradient-to-br from-amber-50/50 via-white to-white p-8 transition-all hover:border-brand-200 hover:shadow-brand-md">
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-3 shadow-sm">
                  <Workflow className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-midnight-800">Powerful Automations</h3>
                <p className="max-w-md text-sm leading-relaxed text-midnight-400">
                  Build custom workflows without code. Auto-assign tasks, send notifications, update statuses, and trigger actions based on events.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  {[
                    { label: 'When task created', icon: '⚡' },
                    { label: 'Assign to team lead', icon: '👤' },
                    { label: 'Notify on Slack', icon: '🔔' },
                  ].map((step, i) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className="rounded-lg border border-surface-300 bg-white px-3 py-2 shadow-sm transition-all group-hover:shadow-brand-sm group-hover:border-brand-100">
                        <div className="flex items-center gap-2">
                          <span>{step.icon}</span>
                          <span className="text-[10px] font-medium text-midnight-500">{step.label}</span>
                        </div>
                      </div>
                      {i < 2 && <ChevronRight className="h-4 w-4 flex-shrink-0 text-brand-300" />}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* AI Features */}
            <Reveal delay={200}>
              <div className="group rounded-2xl border border-surface-300 bg-white p-8 transition-all hover:border-brand-200 hover:shadow-brand-md">
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 p-3 shadow-sm">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-midnight-800">AI Assistant</h3>
                <p className="text-sm leading-relaxed text-midnight-400">
                  AI-powered task descriptions, smart assignment suggestions, and automated status reports.
                </p>
              </div>
            </Reveal>

            {/* Goals */}
            <Reveal delay={250}>
              <div className="group rounded-2xl border border-surface-300 bg-white p-8 transition-all hover:border-brand-200 hover:shadow-brand-md">
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 shadow-sm">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-midnight-800">Goals & OKRs</h3>
                <p className="text-sm leading-relaxed text-midnight-400">
                  Set measurable objectives, track key results, and align projects to organizational goals.
                </p>
              </div>
            </Reveal>

            {/* Budget */}
            <Reveal delay={300}>
              <div className="group rounded-2xl border border-surface-300 bg-white p-8 transition-all hover:border-brand-200 hover:shadow-brand-md">
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-3 shadow-sm">
                  <PieChart className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-midnight-800">Budget Tracking (ETB)</h3>
                <p className="text-sm leading-relaxed text-midnight-400">
                  Track project budgets in Ethiopian Birr. Manage expenses, approvals, and financial reports natively.
                </p>
              </div>
            </Reveal>

            {/* Real-time */}
            <Reveal delay={300}>
              <div className="group rounded-2xl border border-surface-300 bg-white p-8 transition-all hover:border-brand-200 hover:shadow-brand-md">
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 p-3 shadow-sm">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-midnight-800">Real-time Collaboration</h3>
                <p className="text-sm leading-relaxed text-midnight-400">
                  See live updates, cursor presence, real-time comments, and instant notifications across your team.
                </p>
              </div>
            </Reveal>

            {/* Security */}
            <Reveal delay={350}>
              <div className="group rounded-2xl border border-surface-300 bg-white p-8 transition-all hover:border-brand-200 hover:shadow-brand-md">
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 p-3 shadow-sm">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-midnight-800">Enterprise Security</h3>
                <p className="text-sm leading-relaxed text-midnight-400">
                  Role-based access control, two-factor auth, session management, and audit logs. SOC 2 ready.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ PRODUCT DEEP-DIVE ═══════════════════ */}
      <section id="product" className="bg-surface-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5 border border-brand-100">
                <Layers className="h-3.5 w-3.5 text-brand-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">Product</span>
              </div>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-midnight-800 sm:text-4xl lg:text-5xl">
                Built for how Ethiopian teams{' '}
                <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">actually work</span>
              </h2>
              <p className="text-lg text-midnight-400">
                Not another foreign tool with a language pack. Onekof is engineered from the ground up for Ethiopian workflows.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="mx-auto max-w-5xl">
              <div className="mb-8 flex flex-wrap justify-center gap-2">
                {productTabs.map((tab, i) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all ${
                      activeTab === i
                        ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-brand-md'
                        : 'bg-white text-midnight-500 hover:bg-brand-50 hover:text-brand-600 border border-surface-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="overflow-hidden rounded-2xl border border-surface-300 bg-white shadow-xl shadow-brand-900/5">
                <div className="grid items-center gap-0 lg:grid-cols-2">
                  <div className="p-8 lg:p-12">
                    <h3 className="mb-3 text-2xl font-bold text-midnight-800">
                      {productTabs[activeTab].content.title}
                    </h3>
                    <p className="mb-6 text-base leading-relaxed text-midnight-400">
                      {productTabs[activeTab].content.desc}
                    </p>
                    <Link
                      href="/auth/signup"
                      className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Try it free
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                  <div className="bg-gradient-to-br from-brand-50 to-surface-100 p-6 lg:p-8">
                    <div className="rounded-xl border border-brand-100 bg-white p-4 shadow-sm">
                      {activeTab === 0 && (
                        <div className="space-y-3">
                          {['Backlog', 'In Progress', 'Review', 'Done'].map((col, i) => (
                            <div key={col} className="flex items-center gap-3">
                              <div className={`h-2.5 w-2.5 rounded-full ${
                                ['bg-midnight-300', 'bg-brand-500', 'bg-amber-500', 'bg-emerald-500'][i]
                              }`} />
                              <span className="text-xs font-medium text-midnight-600">{col}</span>
                              <div className="flex-1 h-2 rounded-full bg-surface-200">
                                <div
                                  className={`h-full rounded-full ${['bg-midnight-300', 'bg-brand-400', 'bg-amber-400', 'bg-emerald-400'][i]}`}
                                  style={{ width: `${[60, 45, 25, 80][i]}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-midnight-300">{[12, 8, 5, 24][i]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {activeTab === 1 && (
                        <div className="space-y-2">
                          <div className="text-center text-sm font-semibold text-midnight-600 mb-3">መጋቢት 2017</div>
                          <div className="grid grid-cols-7 gap-1">
                            {['ሰ', 'ማ', 'ረ', 'ሐ', 'አ', 'ቅ', 'እ'].map((d) => (
                              <div key={d} className="text-center text-[10px] font-medium text-midnight-300 py-1">{d}</div>
                            ))}
                            {Array.from({ length: 28 }, (_, i) => (
                              <div
                                key={i}
                                className={`h-7 rounded-md text-center text-[10px] leading-7 ${
                                  i === 5 ? 'bg-brand-600 font-bold text-white' :
                                  i === 12 ? 'bg-red-100 font-medium text-red-600' :
                                  i === 18 ? 'bg-amber-100 font-medium text-amber-600' :
                                  'text-midnight-500 hover:bg-brand-50'
                                }`}
                              >
                                {i + 1}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {activeTab === 2 && (
                        <div className="space-y-3">
                          {[
                            { trigger: 'Task → Review', action: 'Assign reviewer', icon: '👤' },
                            { trigger: 'Sprint ends', action: 'Generate report', icon: '📊' },
                            { trigger: 'Bug created', action: 'Alert dev team', icon: '🔔' },
                          ].map((rule) => (
                            <div key={rule.trigger} className="flex items-center gap-3 rounded-lg border border-surface-200 p-3">
                              <span className="text-lg">{rule.icon}</span>
                              <div className="flex-1">
                                <div className="text-xs font-semibold text-midnight-700">{rule.trigger}</div>
                                <div className="text-[10px] text-midnight-300">→ {rule.action}</div>
                              </div>
                              <div className="h-2 w-2 rounded-full bg-emerald-400" />
                            </div>
                          ))}
                        </div>
                      )}
                      {activeTab === 3 && (
                        <div className="space-y-3">
                          {[
                            { label: 'Velocity', value: '34 pts/sprint', trend: '+12%' },
                            { label: 'Completion Rate', value: '87%', trend: '+5%' },
                            { label: 'Avg. Cycle Time', value: '3.2 days', trend: '-18%' },
                          ].map((metric) => (
                            <div key={metric.label} className="flex items-center justify-between rounded-lg border border-surface-200 p-3">
                              <div>
                                <div className="text-[10px] text-midnight-300">{metric.label}</div>
                                <div className="text-sm font-bold text-midnight-800">{metric.value}</div>
                              </div>
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                                {metric.trend}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ STATS SECTION ═══════════════════ */}
      <section className="relative overflow-hidden py-24 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-r from-midnight-900 via-midnight-800 to-brand-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Teams ship faster with Onekof
              </h2>
              <p className="mt-3 text-lg text-midnight-200">
                Real results from real Ethiopian teams
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
            {[
              { value: 500, suffix: '+', label: 'Teams onboarded', icon: Building2 },
              { value: 40, suffix: '%', label: 'Faster delivery', icon: TrendingUp },
              { value: 99, suffix: '.9%', label: 'Platform uptime', icon: Timer },
              { value: 4, suffix: '', label: 'Languages supported', icon: Globe },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 100}>
                <div className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-sm transition-all hover:border-brand-400/30 hover:bg-white/[0.08] sm:p-8">
                  <stat.icon className="mx-auto mb-4 h-6 w-6 text-brand-400" />
                  <div className="text-3xl font-extrabold text-white sm:text-4xl">
                    <Counter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-2 text-sm text-midnight-200">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section id="about" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5 border border-brand-100">
                <Star className="h-3.5 w-3.5 text-brand-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">Testimonials</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-midnight-800 sm:text-4xl">
                Loved by teams who&apos;ve tried everything else
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote: "We tried Jira, Trello, and Asana. None of them understood Ethiopian workflows. Onekof's calendar integration alone saved us hours every week.",
                name: 'Abebe Kebede',
                role: 'CTO, TechEth Solutions',
                initials: 'AK',
                gradient: 'from-brand-500 to-purple-600',
              },
              {
                quote: "Finally, a project management tool our entire team can use — including those who are most comfortable in Amharic. The language support is flawless.",
                name: 'Tigist Haile',
                role: 'PM, Addis Development',
                initials: 'TH',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                quote: "The budget tracking in ETB with approval workflows eliminated our spreadsheet chaos. We now have real-time visibility into every project's financial health.",
                name: 'Dawit Tesfaye',
                role: 'Finance Director, BuildEth',
                initials: 'DT',
                gradient: 'from-accent-coral to-accent-gold',
              },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="group h-full rounded-2xl border border-surface-300 bg-white p-8 transition-all hover:border-brand-200 hover:shadow-brand-md">
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mb-6 text-sm leading-relaxed text-midnight-500">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-sm font-bold text-white shadow-sm`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-midnight-800">{t.name}</p>
                      <p className="text-xs text-midnight-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PRICING ═══════════════════ */}
      <section id="pricing" className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-50 via-white to-surface-50" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5 border border-brand-100">
                <Gem className="h-3.5 w-3.5 text-brand-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">Pricing</span>
              </div>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-midnight-800 sm:text-4xl lg:text-5xl">
                Invest in your team&apos;s productivity
              </h2>
              <p className="text-lg text-midnight-400">
                Start free. Upgrade when you&apos;re ready. No surprises.
              </p>
              <div className="mt-8 inline-flex items-center gap-1 rounded-full bg-white p-1 shadow-sm border border-surface-300">
                <button
                  onClick={() => setActivePricing('monthly')}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                    activePricing === 'monthly' ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-brand-sm' : 'text-midnight-400 hover:text-midnight-600'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setActivePricing('yearly')}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                    activePricing === 'yearly' ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-brand-sm' : 'text-midnight-400 hover:text-midnight-600'
                  }`}
                >
                  Yearly
                  {activePricing !== 'yearly' && <span className="ml-1.5 text-[10px] font-bold text-emerald-500">-20%</span>}
                </button>
              </div>
            </div>
          </Reveal>

          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
            {[
              {
                name: 'Free',
                desc: 'For small teams getting started',
                price: 0,
                yearlyPrice: 0,
                features: [
                  'Up to 10 users',
                  '3 projects',
                  'Kanban & list views',
                  'Ethiopian calendar',
                  '4 language support',
                  'Basic reports',
                ],
                cta: 'Get started free',
                popular: false,
              },
              {
                name: 'Pro',
                desc: 'For growing teams that need more',
                price: 2500,
                yearlyPrice: 1999,
                features: [
                  'Unlimited users',
                  'Unlimited projects',
                  'All views (Timeline, Table)',
                  'Automations & workflows',
                  'Budget tracking (ETB)',
                  'Goals & OKRs',
                  'Advanced analytics',
                  'Priority support',
                ],
                cta: 'Start 14-day free trial',
                popular: true,
              },
              {
                name: 'Enterprise',
                desc: 'For large organizations',
                price: null,
                yearlyPrice: null,
                features: [
                  'Everything in Pro',
                  'SSO & SAML',
                  'Advanced security',
                  'Custom integrations',
                  'Dedicated support',
                  'SLA guarantee',
                  'On-premise option',
                  'Custom training',
                ],
                cta: 'Contact sales',
                popular: false,
              },
            ].map((plan, i) => (
              <Reveal key={plan.name} delay={i * 100}>
                <div
                  className={`relative h-full rounded-2xl border ${
                    plan.popular
                      ? 'border-brand-300 shadow-brand-lg bg-gradient-to-b from-white to-brand-50/30'
                      : 'border-surface-300 bg-white'
                  } p-8 transition-all hover:shadow-brand-md`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-600 to-purple-600 px-4 py-1 text-xs font-bold text-white shadow-brand-md flex items-center gap-1.5">
                      <Crown className="h-3 w-3" />
                      Most Popular
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-midnight-800">{plan.name}</h3>
                    <p className="mt-1 text-sm text-midnight-400">{plan.desc}</p>
                  </div>
                  <div className="mb-6">
                    {plan.price !== null ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-midnight-800">
                          {(activePricing === 'yearly' ? plan.yearlyPrice : plan.price)?.toLocaleString()}
                        </span>
                        <span className="text-sm text-midnight-400">ETB/user/mo</span>
                      </div>
                    ) : (
                      <div className="text-4xl font-extrabold text-midnight-800">Custom</div>
                    )}
                    {plan.price === 0 && (
                      <p className="mt-1 text-xs text-midnight-300">Free forever, no card needed</p>
                    )}
                  </div>
                  <Link
                    href={plan.name === 'Enterprise' ? '#contact' : '/auth/signup'}
                    className={`mb-8 block rounded-xl px-6 py-3.5 text-center text-sm font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-brand-md hover:shadow-brand-lg hover:brightness-110'
                        : 'border border-surface-300 bg-white text-midnight-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-midnight-500">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-500" />
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

      {/* ═══════════════════ COMPARISON STRIP ═══════════════════ */}
      <section className="border-y border-surface-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-midnight-800">Why teams switch to Onekof</h3>
            </div>
          </Reveal>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                from: 'Jira',
                reasons: ['No Ethiopian calendar support', 'English-only interface', 'Overly complex for most teams'],
              },
              {
                from: 'Trello',
                reasons: ['No budget/expense tracking', 'Limited reporting', 'No workflow automation'],
              },
              {
                from: 'Spreadsheets',
                reasons: ['No real-time collaboration', 'No task dependencies', 'Manual status tracking'],
              },
            ].map((item, i) => (
              <Reveal key={item.from} delay={i * 100}>
                <div className="rounded-xl border border-surface-300 p-6 transition-all hover:shadow-brand-md hover:border-brand-200">
                  <p className="mb-4 text-sm font-semibold text-midnight-800">
                    Switching from <span className="text-brand-600">{item.from}</span>?
                  </p>
                  <ul className="space-y-2">
                    {item.reasons.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm text-midnight-400">
                        <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 border-t border-surface-200 pt-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-brand-600">
                      <Check className="h-4 w-4" />
                      Onekof solves all of these
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-midnight-900 via-brand-950 to-midnight-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.25),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-600/10 blur-[120px]" />
          <div className="absolute -right-40 top-0 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-brand-400" />
              <span className="text-sm font-semibold text-brand-300">Ready to transform your workflow?</span>
            </div>
            <h2 className="mb-6 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              Start managing projects{' '}
              <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-brand-300 bg-clip-text text-transparent">
                the Ethiopian way
              </span>
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-midnight-200">
              Join hundreds of teams already using Onekof to plan, track, and deliver projects faster. Free to start, powerful to scale.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-brand-lg transition-all hover:shadow-brand-xl hover:brightness-110 active:scale-[0.98]"
              >
                Get started for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="mailto:hello@onekof.com"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/10"
              >
                <Headphones className="h-4 w-4" />
                Talk to sales
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="border-t border-surface-200 bg-midnight-900">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 shadow-brand-sm">
                  <span className="text-sm font-black text-white">O</span>
                </div>
                <span className="text-lg font-bold text-white">Onekof</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-midnight-200">
                Modern project management built for Ethiopian teams. Native calendar, local languages, and workflows designed for how you actually work.
              </p>
              <div className="mt-6 flex gap-3">
                {['Twitter', 'LinkedIn', 'Telegram'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-xs font-bold text-midnight-300 transition-all hover:bg-brand-600/20 hover:text-brand-400 border border-white/5"
                  >
                    {social[0]}
                  </a>
                ))}
              </div>
            </div>

            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Integrations', 'Changelog', 'Roadmap'],
              },
              {
                title: 'Company',
                links: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
              },
              {
                title: 'Resources',
                links: ['Documentation', 'Help Center', 'API Reference', 'Community', 'Status'],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-midnight-300">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-midnight-300 transition-colors hover:text-brand-400"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
            <p className="text-xs text-midnight-400">
              &copy; {new Date().getFullYear()} Onekof. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Cookies'].map((link) => (
                <a key={link} href="#" className="text-xs text-midnight-400 transition-colors hover:text-brand-400">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

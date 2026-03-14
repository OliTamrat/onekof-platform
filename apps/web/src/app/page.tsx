'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  Clock,
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
  ArrowUpRight,
  Check,
  Building2,
  Layers,
  FileText,
  PieChart,
  TrendingUp,
  Timer,
  Bot,
  Palette,
  Lock,
  Headphones,
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

  // Auto-rotate product tabs
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
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'border-b border-gray-200/60 bg-white/80 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1C8C7D] to-[#0fa392]">
                <span className="text-sm font-black text-white">O</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Onekof</span>
            </Link>
            <div className="hidden items-center gap-1 lg:flex">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
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
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden md:inline">{selectedLang}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1.5 w-44 rounded-xl border border-gray-200 bg-white py-1 shadow-xl shadow-gray-200/50">
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
                          selectedLang === name ? 'bg-[#1C8C7D]/5 font-semibold text-[#1C8C7D]' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Link href="/auth/signin" className="hidden rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:inline-flex">
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-lg bg-[#1C8C7D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#15725f] hover:shadow-md active:scale-[0.98]"
            >
              Get started free
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="ml-1 rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="border-t border-gray-100 bg-white lg:hidden">
            <div className="mx-auto max-w-7xl space-y-1 px-5 py-4">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {item.label}
                </a>
              ))}
              <div className="border-t border-gray-100 pt-3">
                <Link href="/auth/signin" className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Log in
                </Link>
                <Link href="/auth/signup" className="mt-1 block rounded-lg bg-[#1C8C7D] px-4 py-3 text-center text-sm font-semibold text-white">
                  Get started free
                </Link>
              </div>
              {/* Mobile Language */}
              <div className="border-t border-gray-100 pt-3">
                <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Language</p>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(languageMap).map(([code, name]) => (
                    <button
                      key={code}
                      onClick={() => {
                        setSelectedLang(name);
                        document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000;samesite=lax`;
                        window.location.reload();
                      }}
                      className={`rounded-lg px-3 py-2 text-sm ${selectedLang === name ? 'bg-[#1C8C7D]/10 font-semibold text-[#1C8C7D]' : 'text-gray-600 hover:bg-gray-50'}`}
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
      <section className="relative overflow-hidden pt-16">
        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#f0faf8] via-[#f7fffe] to-white" />
          <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(28,140,125,0.12),transparent_65%)]" />
          <div className="absolute -right-20 top-40 h-72 w-72 rounded-full bg-[#1C8C7D]/5 blur-3xl" />
          <div className="absolute -left-20 top-60 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="pb-12 pt-20 text-center sm:pt-28 lg:pt-36">
            {/* Badge */}
            <Reveal>
              <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#1C8C7D]/20 bg-white px-4 py-2 shadow-sm shadow-[#1C8C7D]/5">
                <Sparkles className="h-4 w-4 text-[#1C8C7D]" />
                <span className="text-sm font-semibold text-[#15725f]">
                  The #1 project management tool built for Ethiopia
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-[#1C8C7D]" />
              </div>
            </Reveal>

            {/* Headline */}
            <Reveal delay={100}>
              <h1 className="mx-auto max-w-5xl text-4xl font-extrabold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-[72px]">
                One app to replace{' '}
                <span className="relative">
                  <span className="bg-gradient-to-r from-[#1C8C7D] via-[#0fa392] to-[#15725f] bg-clip-text text-transparent">
                    them all
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                    <path d="M2 6C50 2 150 2 198 6" stroke="#1C8C7D" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
                  </svg>
                </span>
              </h1>
            </Reveal>

            {/* Subheading */}
            <Reveal delay={200}>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-500 sm:text-xl">
                Projects, tasks, goals, budgets, docs, and dashboards — all in one workspace.
                Built natively for Ethiopian teams with the calendar, languages, and workflows you need.
              </p>
            </Reveal>

            {/* CTA Row */}
            <Reveal delay={300}>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/auth/signup"
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#1C8C7D] to-[#0fa392] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#1C8C7D]/25 transition-all hover:shadow-xl hover:shadow-[#1C8C7D]/30 active:scale-[0.98]"
                >
                  Get started — it&apos;s free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#product"
                  className="group inline-flex items-center gap-2.5 rounded-xl border border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
                >
                  <Play className="h-4 w-4 text-[#1C8C7D]" />
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
                  <span key={text} className="flex items-center gap-1.5 text-sm text-gray-400">
                    <CheckCircle2 className="h-4 w-4 text-[#1C8C7D]/60" />
                    {text}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* ─── Product Screenshot ─── */}
          <Reveal delay={500}>
            <div className="relative mx-auto max-w-6xl pb-20">
              {/* Glow effect behind screenshot */}
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-b from-[#1C8C7D]/8 via-[#1C8C7D]/4 to-transparent blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl shadow-gray-900/10 ring-1 ring-black/5">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50/80 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                    <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                    <div className="h-3 w-3 rounded-full bg-[#27CA40]" />
                  </div>
                  <div className="ml-3 flex-1 rounded-lg bg-white px-4 py-1.5 text-xs text-gray-400 border border-gray-200/80">
                    <span className="text-gray-300">https://</span>app.onekof.com/dashboard
                  </div>
                </div>

                {/* Dashboard Preview */}
                <div className="bg-[#0F1419] p-0.5">
                  <div className="flex min-h-[420px] sm:min-h-[480px]">
                    {/* Sidebar */}
                    <div className="hidden w-52 flex-shrink-0 border-r border-white/5 bg-[#161B22] p-4 lg:block">
                      <div className="mb-6 flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1C8C7D] to-[#0fa392]">
                          <span className="text-xs font-black text-white">O</span>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-white">Onekof</span>
                          <p className="text-[10px] text-gray-500">Professional</p>
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
                                ? 'bg-[#1C8C7D]/15 text-[#1C8C7D]'
                                : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
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
                      {/* Top bar */}
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-white">Sprint Dashboard</h3>
                          <p className="mt-0.5 text-xs text-gray-500">መጋቢት 2017 E.C. &middot; Sprint 12</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="hidden items-center gap-1 rounded-lg bg-white/5 px-2 py-1 sm:flex">
                            {['Board', 'List', 'Timeline'].map((v, i) => (
                              <button
                                key={v}
                                className={`rounded-md px-2.5 py-1 text-[10px] font-medium ${
                                  i === 0 ? 'bg-[#1C8C7D] text-white' : 'text-gray-400 hover:text-gray-300'
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                          <button className="rounded-lg bg-[#1C8C7D] px-3 py-1.5 text-xs font-semibold text-white">
                            + New Issue
                          </button>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                        {[
                          { label: 'Total Tasks', value: '47', change: '+5', color: 'text-white', bg: 'bg-white/5' },
                          { label: 'Completed', value: '24', change: '51%', color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
                          { label: 'In Progress', value: '11', change: '', color: 'text-blue-400', bg: 'bg-blue-500/5' },
                          { label: 'Due Today', value: '3', change: '', color: 'text-amber-400', bg: 'bg-amber-500/5' },
                        ].map((stat) => (
                          <div key={stat.label} className={`rounded-xl ${stat.bg} border border-white/5 p-3`}>
                            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <span className="text-[10px] text-gray-500">{stat.label}</span>
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
                            color: 'bg-gray-500',
                            count: 6,
                            tasks: [
                              { name: 'Payment gateway integration', tag: 'Backend', tagBg: 'bg-purple-500/15 text-purple-400', priority: 'high' },
                              { name: 'የተጠቃሚ ፕሮፋይል ገጽ', tag: 'Frontend', tagBg: 'bg-blue-500/15 text-blue-400', priority: 'med' },
                            ],
                          },
                          {
                            title: 'To Do',
                            color: 'bg-yellow-500',
                            count: 4,
                            tasks: [
                              { name: 'Multi-language support', tag: 'i18n', tagBg: 'bg-cyan-500/15 text-cyan-400', priority: 'high' },
                            ],
                          },
                          {
                            title: 'In Progress',
                            color: 'bg-[#1C8C7D]',
                            count: 3,
                            tasks: [
                              { name: 'Calendar component', tag: '67%', tagBg: 'bg-[#1C8C7D]/15 text-[#1C8C7D]', progress: 67, priority: 'high' },
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
                              <span className="text-[11px] font-semibold text-gray-300">{col.title}</span>
                              <span className="ml-auto rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] text-gray-500">{col.count}</span>
                            </div>
                            <div className="space-y-1.5">
                              {col.tasks.map((task) => (
                                <div key={task.name} className="rounded-lg border border-white/5 bg-[#161B22] p-2.5 transition-colors hover:bg-[#1B2028]">
                                  <div className="mb-1.5 flex items-start justify-between gap-1">
                                    <span className="text-[11px] font-medium leading-snug text-gray-200">{task.name}</span>
                                    <div className={`mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                                      task.priority === 'high' ? 'bg-red-400' : task.priority === 'med' ? 'bg-yellow-400' : 'bg-emerald-400'
                                    }`} />
                                  </div>
                                  {task.progress !== undefined && (
                                    <div className="mb-1.5 h-1 w-full overflow-hidden rounded-full bg-white/5">
                                      <div className="h-full rounded-full bg-[#1C8C7D]" style={{ width: `${task.progress}%` }} />
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
              {/* Floating cards around screenshot */}
              <div className="absolute -left-4 bottom-32 hidden rounded-xl border border-gray-200 bg-white p-3 shadow-lg lg:block">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                    <Check className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Task completed</p>
                    <p className="text-[10px] text-gray-500">Payment integration done</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 top-40 hidden rounded-xl border border-gray-200 bg-white p-3 shadow-lg lg:block">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C8C7D]/10">
                    <Users className="h-4 w-4 text-[#1C8C7D]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">3 members online</p>
                    <p className="text-[10px] text-gray-500">Collaborating in real-time</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ LOGOS / SOCIAL PROOF ═══════════════════ */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
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
              <div key={co.name} className="group flex items-center gap-2 text-gray-300 transition-all hover:text-gray-500">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-gray-200">
                  <span className="text-sm font-bold text-gray-400 transition-colors group-hover:text-gray-600">
                    {co.abbr}
                  </span>
                </div>
                <span className="hidden text-xs font-medium text-gray-400 transition-colors group-hover:text-gray-600 sm:inline">
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
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#1C8C7D]/5 px-3.5 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#1C8C7D]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1C8C7D]">Features</span>
              </div>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                Everything your team needs.{' '}
                <span className="bg-gradient-to-r from-[#1C8C7D] to-[#0fa392] bg-clip-text text-transparent">Nothing it doesn&apos;t.</span>
              </h2>
              <p className="text-lg text-gray-500">
                Purpose-built for Ethiopian organizations with features you won&apos;t find in any other tool.
              </p>
            </div>
          </Reveal>

          {/* Bento Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Large card - Ethiopian Calendar */}
            <Reveal delay={100} className="sm:col-span-2 lg:col-span-2">
              <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-[#f0faf8] to-white p-8 transition-all hover:border-[#1C8C7D]/30 hover:shadow-lg hover:shadow-[#1C8C7D]/5">
                <div className="relative z-10">
                  <div className="mb-4 inline-flex rounded-xl bg-[#1C8C7D]/10 p-3">
                    <Calendar className="h-6 w-6 text-[#1C8C7D]" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Ethiopian Calendar Integration</h3>
                  <p className="max-w-md text-sm leading-relaxed text-gray-500">
                    The only project management tool with native Ethiopian calendar support. Plan sprints around Pagume, set deadlines in Meskerem, and track milestones the way you think about time.
                  </p>
                </div>
                {/* Mini Calendar Preview */}
                <div className="absolute -right-4 -bottom-4 hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-xl opacity-80 transition-all group-hover:opacity-100 sm:block">
                  <div className="mb-2 text-center text-xs font-semibold text-gray-700">መጋቢት 2017</div>
                  <div className="grid grid-cols-7 gap-1">
                    {['ሰ', 'ማ', 'ረ', 'ሐ', 'አ', 'ቅ', 'እ'].map((d) => (
                      <div key={d} className="text-center text-[9px] font-medium text-gray-400">{d}</div>
                    ))}
                    {Array.from({ length: 30 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-5 w-5 rounded text-center text-[9px] leading-5 ${
                          i === 13 ? 'bg-[#1C8C7D] font-bold text-white' : i === 20 ? 'bg-amber-100 font-medium text-amber-700' : 'text-gray-600 hover:bg-gray-50'
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
              <div className="group rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-[#1C8C7D]/30 hover:shadow-lg hover:shadow-[#1C8C7D]/5">
                <div className="mb-4 inline-flex rounded-xl bg-purple-50 p-3">
                  <Languages className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">4 Native Languages</h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  Full interface in Amharic, Afaan Oromoo, Tigrinya, and English. Every label, button, and notification.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {['English', 'አማርኛ', 'Oromoo', 'ትግርኛ'].map((l) => (
                    <span key={l} className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600">{l}</span>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Kanban */}
            <Reveal delay={150}>
              <div className="group rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-[#1C8C7D]/30 hover:shadow-lg hover:shadow-[#1C8C7D]/5">
                <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3">
                  <Kanban className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Multiple Views</h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  Kanban boards, list view, timeline, and table view. Work the way your team thinks best.
                </p>
              </div>
            </Reveal>

            {/* Automation - Large */}
            <Reveal delay={250} className="sm:col-span-2">
              <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-amber-50/50 to-white p-8 transition-all hover:border-[#1C8C7D]/30 hover:shadow-lg hover:shadow-[#1C8C7D]/5">
                <div className="mb-4 inline-flex rounded-xl bg-amber-50 p-3">
                  <Workflow className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Powerful Automations</h3>
                <p className="max-w-md text-sm leading-relaxed text-gray-500">
                  Build custom workflows without code. Auto-assign tasks, send notifications, update statuses, and trigger actions based on events.
                </p>
                {/* Automation flow preview */}
                <div className="mt-6 flex items-center gap-3">
                  {[
                    { label: 'When task created', icon: '⚡' },
                    { label: 'Assign to team lead', icon: '👤' },
                    { label: 'Notify on Slack', icon: '🔔' },
                  ].map((step, i) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span>{step.icon}</span>
                          <span className="text-[10px] font-medium text-gray-600">{step.label}</span>
                        </div>
                      </div>
                      {i < 2 && <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* AI Features */}
            <Reveal delay={200}>
              <div className="group rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-[#1C8C7D]/30 hover:shadow-lg hover:shadow-[#1C8C7D]/5">
                <div className="mb-4 inline-flex rounded-xl bg-violet-50 p-3">
                  <Bot className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">AI Assistant</h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  AI-powered task descriptions, smart assignment suggestions, and automated status reports.
                </p>
              </div>
            </Reveal>

            {/* Goals */}
            <Reveal delay={250}>
              <div className="group rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-[#1C8C7D]/30 hover:shadow-lg hover:shadow-[#1C8C7D]/5">
                <div className="mb-4 inline-flex rounded-xl bg-emerald-50 p-3">
                  <Target className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Goals & OKRs</h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  Set measurable objectives, track key results, and align projects to organizational goals.
                </p>
              </div>
            </Reveal>

            {/* Budget */}
            <Reveal delay={300}>
              <div className="group rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-[#1C8C7D]/30 hover:shadow-lg hover:shadow-[#1C8C7D]/5">
                <div className="mb-4 inline-flex rounded-xl bg-teal-50 p-3">
                  <PieChart className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Budget Tracking (ETB)</h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  Track project budgets in Ethiopian Birr. Manage expenses, approvals, and financial reports natively.
                </p>
              </div>
            </Reveal>

            {/* Real-time */}
            <Reveal delay={300}>
              <div className="group rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-[#1C8C7D]/30 hover:shadow-lg hover:shadow-[#1C8C7D]/5">
                <div className="mb-4 inline-flex rounded-xl bg-rose-50 p-3">
                  <Zap className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Real-time Collaboration</h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  See live updates, cursor presence, real-time comments, and instant notifications across your team.
                </p>
              </div>
            </Reveal>

            {/* Security */}
            <Reveal delay={350}>
              <div className="group rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-[#1C8C7D]/30 hover:shadow-lg hover:shadow-[#1C8C7D]/5">
                <div className="mb-4 inline-flex rounded-xl bg-slate-50 p-3">
                  <Shield className="h-6 w-6 text-slate-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Enterprise Security</h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  Role-based access control, two-factor auth, session management, and audit logs. SOC 2 ready.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ PRODUCT DEEP-DIVE ═══════════════════ */}
      <section id="product" className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#1C8C7D]/5 px-3.5 py-1.5">
                <Layers className="h-3.5 w-3.5 text-[#1C8C7D]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1C8C7D]">Product</span>
              </div>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                Built for how Ethiopian teams{' '}
                <span className="bg-gradient-to-r from-[#1C8C7D] to-[#0fa392] bg-clip-text text-transparent">actually work</span>
              </h2>
              <p className="text-lg text-gray-500">
                Not another foreign tool with a language pack. Onekof is engineered from the ground up for Ethiopian workflows.
              </p>
            </div>
          </Reveal>

          {/* Tab Switcher */}
          <Reveal delay={100}>
            <div className="mx-auto max-w-5xl">
              <div className="mb-8 flex flex-wrap justify-center gap-2">
                {productTabs.map((tab, i) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all ${
                      activeTab === i
                        ? 'bg-[#1C8C7D] text-white shadow-md shadow-[#1C8C7D]/20'
                        : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50">
                <div className="grid items-center gap-0 lg:grid-cols-2">
                  <div className="p-8 lg:p-12">
                    <h3 className="mb-3 text-2xl font-bold text-gray-900">
                      {productTabs[activeTab].content.title}
                    </h3>
                    <p className="mb-6 text-base leading-relaxed text-gray-500">
                      {productTabs[activeTab].content.desc}
                    </p>
                    <Link
                      href="/auth/signup"
                      className="group inline-flex items-center gap-2 text-sm font-semibold text-[#1C8C7D] hover:text-[#15725f]"
                    >
                      Try it free
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                  {/* Product Preview Panel */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 lg:p-8">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      {activeTab === 0 && (
                        <div className="space-y-3">
                          {['Backlog', 'In Progress', 'Review', 'Done'].map((col, i) => (
                            <div key={col} className="flex items-center gap-3">
                              <div className={`h-2.5 w-2.5 rounded-full ${
                                ['bg-gray-400', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500'][i]
                              }`} />
                              <span className="text-xs font-medium text-gray-700">{col}</span>
                              <div className="flex-1 h-2 rounded-full bg-gray-100">
                                <div
                                  className={`h-full rounded-full ${['bg-gray-300', 'bg-blue-400', 'bg-amber-400', 'bg-emerald-400'][i]}`}
                                  style={{ width: `${[60, 45, 25, 80][i]}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-gray-400">{[12, 8, 5, 24][i]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {activeTab === 1 && (
                        <div className="space-y-2">
                          <div className="text-center text-sm font-semibold text-gray-700 mb-3">መጋቢት 2017</div>
                          <div className="grid grid-cols-7 gap-1">
                            {['ሰ', 'ማ', 'ረ', 'ሐ', 'አ', 'ቅ', 'እ'].map((d) => (
                              <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
                            ))}
                            {Array.from({ length: 28 }, (_, i) => (
                              <div
                                key={i}
                                className={`h-7 rounded-md text-center text-[10px] leading-7 ${
                                  i === 5 ? 'bg-[#1C8C7D] font-bold text-white' :
                                  i === 12 ? 'bg-red-100 font-medium text-red-600' :
                                  i === 18 ? 'bg-amber-100 font-medium text-amber-600' :
                                  'text-gray-600 hover:bg-gray-50'
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
                            <div key={rule.trigger} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
                              <span className="text-lg">{rule.icon}</span>
                              <div className="flex-1">
                                <div className="text-xs font-semibold text-gray-800">{rule.trigger}</div>
                                <div className="text-[10px] text-gray-400">→ {rule.action}</div>
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
                            <div key={metric.label} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                              <div>
                                <div className="text-[10px] text-gray-400">{metric.label}</div>
                                <div className="text-sm font-bold text-gray-900">{metric.value}</div>
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
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F1419] to-[#1B2028]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(28,140,125,0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Teams ship faster with Onekof
              </h2>
              <p className="mt-3 text-lg text-gray-400">
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
                <div className="group rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm transition-all hover:border-[#1C8C7D]/30 hover:bg-white/10 sm:p-8">
                  <stat.icon className="mx-auto mb-4 h-6 w-6 text-[#1C8C7D]" />
                  <div className="text-3xl font-extrabold text-white sm:text-4xl">
                    <Counter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-2 text-sm text-gray-400">{stat.label}</p>
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
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#1C8C7D]/5 px-3.5 py-1.5">
                <Star className="h-3.5 w-3.5 text-[#1C8C7D]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1C8C7D]">Testimonials</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
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
                color: 'bg-blue-500',
              },
              {
                quote: "Finally, a project management tool our entire team can use — including those who are most comfortable in Amharic. The language support is flawless.",
                name: 'Tigist Haile',
                role: 'PM, Addis Development',
                initials: 'TH',
                color: 'bg-[#1C8C7D]',
              },
              {
                quote: "The budget tracking in ETB with approval workflows eliminated our spreadsheet chaos. We now have real-time visibility into every project's financial health.",
                name: 'Dawit Tesfaye',
                role: 'Finance Director, BuildEth',
                initials: 'DT',
                color: 'bg-purple-500',
              },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="group h-full rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-[#1C8C7D]/20 hover:shadow-xl hover:shadow-gray-200/50">
                  {/* Stars */}
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mb-6 text-sm leading-relaxed text-gray-600">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${t.color} text-sm font-bold text-white`}>
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PRICING ═══════════════════ */}
      <section id="pricing" className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#1C8C7D]/5 px-3.5 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#1C8C7D]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1C8C7D]">Pricing</span>
              </div>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-gray-500">
                Start free. Upgrade when you&apos;re ready. No surprises.
              </p>
              {/* Toggle */}
              <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-white p-1 shadow-sm border border-gray-200">
                <button
                  onClick={() => setActivePricing('monthly')}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                    activePricing === 'monthly' ? 'bg-[#1C8C7D] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setActivePricing('yearly')}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                    activePricing === 'yearly' ? 'bg-[#1C8C7D] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Yearly
                  <span className="ml-1.5 text-[10px] font-bold text-emerald-300">-20%</span>
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
                bg: 'bg-white',
              },
              {
                name: 'Pro',
                desc: 'For growing teams that need more',
                price: 499,
                yearlyPrice: 399,
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
                bg: 'bg-white',
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
                bg: 'bg-white',
              },
            ].map((plan, i) => (
              <Reveal key={plan.name} delay={i * 100}>
                <div
                  className={`relative h-full rounded-2xl border ${
                    plan.popular
                      ? 'border-[#1C8C7D] shadow-xl shadow-[#1C8C7D]/10'
                      : 'border-gray-200'
                  } ${plan.bg} p-8 transition-all hover:shadow-lg`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#1C8C7D] to-[#0fa392] px-4 py-1 text-xs font-bold text-white shadow-md">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{plan.desc}</p>
                  </div>
                  <div className="mb-6">
                    {plan.price !== null ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-gray-900">
                          {activePricing === 'yearly' ? plan.yearlyPrice : plan.price}
                        </span>
                        <span className="text-sm text-gray-500">ETB/user/mo</span>
                      </div>
                    ) : (
                      <div className="text-4xl font-extrabold text-gray-900">Custom</div>
                    )}
                    {plan.price === 0 && (
                      <p className="mt-1 text-xs text-gray-400">Free forever, no card needed</p>
                    )}
                  </div>
                  <Link
                    href={plan.name === 'Enterprise' ? '#contact' : '/auth/signup'}
                    className={`mb-8 block rounded-xl px-6 py-3 text-center text-sm font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-[#1C8C7D] to-[#0fa392] text-white shadow-md shadow-[#1C8C7D]/20 hover:shadow-lg hover:shadow-[#1C8C7D]/30'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1C8C7D]" />
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
      <section className="border-y border-gray-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-gray-900">Why teams switch to Onekof</h3>
            </div>
          </Reveal>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                from: 'Jira',
                reasons: ['No Ethiopian calendar support', 'English-only interface', 'Overly complex for most teams'],
                icon: '🔄',
              },
              {
                from: 'Trello',
                reasons: ['No budget/expense tracking', 'Limited reporting', 'No workflow automation'],
                icon: '🔄',
              },
              {
                from: 'Spreadsheets',
                reasons: ['No real-time collaboration', 'No task dependencies', 'Manual status tracking'],
                icon: '🔄',
              },
            ].map((item, i) => (
              <Reveal key={item.from} delay={i * 100}>
                <div className="rounded-xl border border-gray-200 p-6 transition-all hover:shadow-md">
                  <p className="mb-4 text-sm font-semibold text-gray-900">
                    Switching from <span className="text-[#1C8C7D]">{item.from}</span>?
                  </p>
                  <ul className="space-y-2">
                    {item.reasons.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm text-gray-500">
                        <X className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-[#1C8C7D]">
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F1419] via-[#1B2028] to-[#0F1419]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(28,140,125,0.2),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#1C8C7D]/20 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-[#1C8C7D]" />
              <span className="text-sm font-semibold text-[#1C8C7D]">Ready to transform your workflow?</span>
            </div>
            <h2 className="mb-6 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              Start managing projects{' '}
              <span className="bg-gradient-to-r from-[#1C8C7D] to-emerald-400 bg-clip-text text-transparent">
                the Ethiopian way
              </span>
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400">
              Join hundreds of teams already using Onekof to plan, track, and deliver projects faster. Free to start, powerful to scale.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#1C8C7D] to-[#0fa392] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#1C8C7D]/25 transition-all hover:shadow-xl hover:shadow-[#1C8C7D]/40 active:scale-[0.98]"
              >
                Get started for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="mailto:hello@onekof.com"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition-all hover:border-white/40 hover:bg-white/5"
              >
                <Headphones className="h-4 w-4" />
                Talk to sales
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1C8C7D] to-[#0fa392]">
                  <span className="text-sm font-black text-white">O</span>
                </div>
                <span className="text-lg font-bold text-gray-900">Onekof</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
                Modern project management built for Ethiopian teams. Native calendar, local languages, and workflows designed for how you actually work.
              </p>
              <div className="mt-6 flex gap-3">
                {['Twitter', 'LinkedIn', 'Telegram'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-400 transition-colors hover:bg-[#1C8C7D]/10 hover:text-[#1C8C7D]"
                  >
                    {social[0]}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
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
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Onekof. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Cookies'].map((link) => (
                <a key={link} href="#" className="text-xs text-gray-400 transition-colors hover:text-gray-600">
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

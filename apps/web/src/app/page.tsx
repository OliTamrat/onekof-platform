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
  MessageSquare,
  Clock,
  ChevronDown,
  Menu,
  X,
  Layers,
  GitBranch,
  Bell,
  Target,
  Workflow,
  Languages,
} from 'lucide-react';

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  const languageMap: Record<string, string> = {
    en: 'English',
    am: 'አማርኛ',
    om: 'Afaan Oromoo',
    ti: 'ትግርኛ',
  };
  const localeCodeMap: Record<string, string> = {
    English: 'en',
    'አማርኛ': 'am',
    'Afaan Oromoo': 'om',
    'ትግርኛ': 'ti',
  };

  const getCurrentLocale = () => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/NEXT_LOCALE=(\w+)/);
      return match ? match[1] : 'en';
    }
    return 'en';
  };
  const [selectedLanguage, setSelectedLanguage] = useState(
    () => languageMap[getCurrentLocale()] || 'English'
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <div className="bg-white antialiased">
      {/* Navigation */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'border-b border-gray-200/60 bg-white/80 backdrop-blur-xl shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1C8C7D]">
                  <span className="text-base font-bold text-white">O</span>
                </div>
                <span className="text-lg font-bold text-gray-900">Onekof</span>
              </Link>
              <div className="hidden items-center gap-8 lg:flex">
                {['Features', 'Product', 'Pricing', 'About'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <Globe className="h-4 w-4" />
                  <span className="hidden md:inline">{selectedLanguage}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLanguageOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsLanguageOpen(false)} />
                    <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                      {Object.entries(languageMap).map(([code, name]) => (
                        <button
                          key={code}
                          onClick={() => {
                            setSelectedLanguage(name);
                            setIsLanguageOpen(false);
                            document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000;samesite=lax`;
                            window.location.reload();
                          }}
                          className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors ${
                            selectedLanguage === name
                              ? 'bg-[#1C8C7D]/5 font-semibold text-[#1C8C7D]'
                              : 'text-gray-700 hover:bg-gray-50'
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
                className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 sm:inline-block"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-[#1C8C7D] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#15725f] hover:shadow-md"
              >
                Get started free
              </Link>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white lg:hidden">
            <div className="mx-auto max-w-7xl space-y-1 px-5 py-4">
              {['Features', 'Product', 'Pricing', 'About'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {item}
                </a>
              ))}
              <div className="border-t border-gray-100 pt-3">
                <Link
                  href="/auth/signin"
                  className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="mt-1 block rounded-lg bg-[#1C8C7D] px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Get started free
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden pt-16">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#f0faf8] via-white to-white" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(28,140,125,0.08),transparent_70%)]" />

        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="pb-16 pt-20 text-center sm:pt-28 lg:pt-32">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1C8C7D]/15 bg-[#1C8C7D]/5 px-4 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1C8C7D] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1C8C7D]" />
              </span>
              <span className="text-sm font-medium text-[#15725f]">
                Built for Ethiopian teams
              </span>
            </div>

            {/* Headline */}
            <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl">
              The project management{' '}
              <span className="bg-gradient-to-r from-[#1C8C7D] to-[#0fa392] bg-clip-text text-transparent">
                platform
              </span>{' '}
              your team deserves
            </h1>

            {/* Subheading */}
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl">
              Plan, track, and ship with the only tool that speaks your language.
              Native Ethiopian calendar, 4 languages, AI-powered workflows, and
              real-time collaboration.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#1C8C7D] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#1C8C7D]/20 transition-all hover:bg-[#15725f] hover:shadow-xl hover:shadow-[#1C8C7D]/25"
              >
                Start for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#product"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-900 transition-all hover:border-gray-400 hover:bg-gray-50"
              >
                See how it works
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#1C8C7D]" />
                Free for up to 10 users
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#1C8C7D]" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#1C8C7D]" />
                Setup in under 2 minutes
              </span>
            </div>
          </div>

          {/* Product Screenshot */}
          <div className="relative mx-auto max-w-6xl pb-20">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-[#1C8C7D]/10 via-[#1C8C7D]/5 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xl shadow-gray-900/10 ring-1 ring-gray-900/5">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="ml-3 flex-1 rounded-md bg-white px-3 py-1 text-xs text-gray-400 border border-gray-200">
                  app.onekof.com/dashboard
                </div>
              </div>

              {/* Dashboard Preview */}
              <div className="bg-[#1B1F23] p-1">
                <div className="flex">
                  {/* Sidebar */}
                  <div className="hidden w-56 flex-shrink-0 border-r border-gray-800 bg-[#22272B] p-4 sm:block">
                    <div className="mb-6 flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-[#1C8C7D] flex items-center justify-center">
                        <span className="text-xs font-bold text-white">O</span>
                      </div>
                      <span className="text-sm font-semibold text-white">Onekof</span>
                    </div>
                    <div className="space-y-1">
                      {[
                        { name: 'Dashboard', active: true },
                        { name: 'Projects', active: false },
                        { name: 'Issues', active: false },
                        { name: 'Teams', active: false },
                        { name: 'Calendar', active: false },
                        { name: 'Reports', active: false },
                      ].map((item) => (
                        <div
                          key={item.name}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                            item.active
                              ? 'bg-[#1C8C7D]/20 text-[#1C8C7D]'
                              : 'text-gray-400'
                          }`}
                        >
                          {item.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-white">Sprint Dashboard</h3>
                        <p className="text-xs text-gray-400">የካቲት 2017 &middot; Week 3</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="rounded-md bg-[#1C8C7D] px-3 py-1.5 text-xs font-semibold text-white">
                          + New Issue
                        </div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="mb-4 grid grid-cols-4 gap-3">
                      {[
                        { label: 'Completed', value: '24', color: 'text-green-400' },
                        { label: 'In Progress', value: '8', color: 'text-blue-400' },
                        { label: 'To Do', value: '12', color: 'text-gray-400' },
                        { label: 'Due Soon', value: '3', color: 'text-amber-400' },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-lg bg-[#22272B] p-3">
                          <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                          <div className="text-[10px] text-gray-500">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Kanban Preview */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          title: 'To Do',
                          count: 3,
                          color: 'bg-gray-500',
                          tasks: [
                            { name: 'የተጠቃሚ በይነገጽ ንድፍ', tag: 'Design', tagColor: 'bg-blue-500/20 text-blue-400' },
                            { name: 'API Integration', tag: 'Backend', tagColor: 'bg-purple-500/20 text-purple-400' },
                          ],
                        },
                        {
                          title: 'In Progress',
                          count: 2,
                          color: 'bg-[#1C8C7D]',
                          tasks: [
                            { name: 'Payment Gateway', tag: '67%', tagColor: 'bg-[#1C8C7D]/20 text-[#1C8C7D]', progress: 67 },
                          ],
                        },
                        {
                          title: 'Done',
                          count: 5,
                          color: 'bg-green-500',
                          tasks: [
                            { name: 'Database Schema', tag: 'Done', tagColor: 'bg-green-500/20 text-green-400' },
                          ],
                        },
                      ].map((col) => (
                        <div key={col.title} className="rounded-lg bg-[#22272B] p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${col.color}`} />
                            <span className="text-xs font-medium text-gray-300">{col.title}</span>
                            <span className="ml-auto text-[10px] text-gray-500">{col.count}</span>
                          </div>
                          <div className="space-y-2">
                            {col.tasks.map((task) => (
                              <div key={task.name} className="rounded-md border border-gray-700/50 bg-[#1B1F23] p-2.5">
                                <div className="mb-1.5 text-xs font-medium text-gray-200">{task.name}</div>
                                {task.progress && (
                                  <div className="mb-1.5 h-1 w-full rounded-full bg-gray-700">
                                    <div className="h-1 rounded-full bg-[#1C8C7D]" style={{ width: `${task.progress}%` }} />
                                  </div>
                                )}
                                <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${task.tagColor}`}>
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
          </div>
        </div>
      </section>

      {/* ===== LOGOS / SOCIAL PROOF ===== */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <p className="mb-10 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            Trusted by leading Ethiopian organizations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8">
            {[
              { name: 'Ethio Telecom', letters: 'ET' },
              { name: 'Commercial Bank of Ethiopia', letters: 'CBE' },
              { name: 'Ethiopian Airlines', letters: 'EA' },
              { name: 'Safaricom Ethiopia', letters: 'SE' },
              { name: 'Awash Bank', letters: 'AB' },
              { name: 'BGI Ethiopia', letters: 'BGI' },
            ].map((company) => (
              <div
                key={company.name}
                className="flex items-center gap-2 text-gray-300 transition-colors hover:text-gray-500"
              >
                <span className="text-2xl font-bold tracking-tight">{company.letters}</span>
                <span className="hidden text-xs font-medium sm:inline">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div
            id="features-header"
            data-animate
            className={`mx-auto mb-16 max-w-2xl text-center transition-all duration-700 ${
              isVisible('features-header') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#1C8C7D]">
              Features
            </p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything your team needs to ship faster
            </h2>
            <p className="text-lg text-gray-600">
              Purpose-built for Ethiopian teams with features you won&apos;t find anywhere else.
            </p>
          </div>

          <div
            id="features-grid"
            data-animate
            className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-700 delay-200 ${
              isVisible('features-grid') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            {[
              {
                icon: Calendar,
                title: 'Ethiopian Calendar',
                description:
                  'Native Ethiopian calendar support throughout. Plan sprints, set deadlines, and track milestones in the calendar you actually use.',
                highlight: true,
              },
              {
                icon: Languages,
                title: '4 Native Languages',
                description:
                  'Full interface in Amharic, Afaan Oromoo, Tigrinya, and English. Every button, every label, every notification.',
              },
              {
                icon: Kanban,
                title: 'Kanban & List Views',
                description:
                  'Drag-and-drop boards, list views, and table views. Organize work the way your team thinks.',
              },
              {
                icon: Zap,
                title: 'AI-Powered Workflows',
                description:
                  'Automate repetitive tasks with intelligent workflow rules. Set triggers, conditions, and actions in minutes.',
              },
              {
                icon: Users,
                title: 'Real-Time Collaboration',
                description:
                  'See who\'s online, get instant updates, and collaborate without refresh. Built on server-sent events.',
              },
              {
                icon: BarChart3,
                title: 'Analytics & Reports',
                description:
                  'Status overviews, priority breakdowns, velocity tracking, and team performance — all at a glance.',
              },
              {
                icon: Target,
                title: 'Sprint Management',
                description:
                  'Plan sprints, track velocity, manage backlogs, and run retrospectives with built-in agile tools.',
              },
              {
                icon: GitBranch,
                title: 'Issue Tracking',
                description:
                  'Tasks, stories, bugs, and epics with custom fields, priorities, labels, and powerful filtering.',
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description:
                  'Role-based access, audit logs, SSO support, and data encryption. Your data stays in your control.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`group rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg ${
                  feature.highlight
                    ? 'border-[#1C8C7D]/20 bg-gradient-to-br from-[#1C8C7D]/5 to-transparent hover:border-[#1C8C7D]/40'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div
                  className={`mb-4 inline-flex rounded-xl p-2.5 ${
                    feature.highlight
                      ? 'bg-[#1C8C7D]/10 text-[#1C8C7D]'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-[#1C8C7D]/10 group-hover:text-[#1C8C7D]'
                  } transition-colors duration-300`}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRODUCT DEEP-DIVE: Ethiopian Calendar ===== */}
      <section id="product" className="overflow-hidden border-y border-gray-100 bg-gray-50/80 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div
            id="calendar-section"
            data-animate
            className={`grid items-center gap-16 lg:grid-cols-2 transition-all duration-700 ${
              isVisible('calendar-section') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#1C8C7D]/10 px-4 py-1.5">
                <Calendar className="h-4 w-4 text-[#1C8C7D]" />
                <span className="text-sm font-semibold text-[#1C8C7D]">Ethiopian Calendar</span>
              </div>

              <h2 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Work in your own time
              </h2>

              <p className="mb-8 text-lg leading-relaxed text-gray-600">
                The only project management tool with native Ethiopian calendar support.
                Plan sprints in መስከረም, not September. Set deadlines in ግንቦት, not May.
              </p>

              <ul className="space-y-4">
                {[
                  'Ethiopian calendar integrated throughout the entire app',
                  'Automatic Gregorian-to-Ethiopian date conversion',
                  'Ethiopian holidays and working day awareness',
                  'Dual-calendar view for international teams',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1C8C7D]" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Calendar Widget */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#1C8C7D]/10 to-transparent blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Today</div>
                    <div className="text-2xl font-bold text-gray-900">መጋቢት 5, 2018</div>
                    <div className="text-sm text-gray-500">March 14, 2026</div>
                  </div>
                  <div className="rounded-xl bg-[#1C8C7D] p-3">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Mini Calendar Grid */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-3 text-center text-sm font-bold text-gray-900">መጋቢት 2018</div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <div key={i} className="text-center text-[10px] font-semibold text-gray-400 pb-1">
                        {d}
                      </div>
                    ))}
                    {[...Array(30)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors ${
                          i + 1 === 5
                            ? 'bg-[#1C8C7D] text-white font-bold'
                            : i + 1 === 10 || i + 1 === 20
                            ? 'bg-amber-100 text-amber-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming */}
                <div className="mt-5 space-y-2">
                  {[
                    { name: 'Sprint Review', date: 'መጋቢት 7', dot: 'bg-[#1C8C7D]' },
                    { name: 'Release v2.0', date: 'መጋቢት 15', dot: 'bg-amber-500' },
                    { name: 'Team Retro', date: 'መጋቢት 20', dot: 'bg-blue-500' },
                  ].map((event) => (
                    <div key={event.name} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      <div className={`h-2 w-2 rounded-full ${event.dot}`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{event.name}</div>
                        <div className="text-xs text-gray-500">{event.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRODUCT DEEP-DIVE: Languages ===== */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div
            id="languages-section"
            data-animate
            className={`grid items-center gap-16 lg:grid-cols-2 transition-all duration-700 ${
              isVisible('languages-section') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            {/* Language Cards */}
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { lang: 'Amharic', native: 'አማርኛ', sample: 'ፕሮጀክቶች', script: 'Ge\'ez', flag: '🇪🇹' },
                  { lang: 'English', native: 'English', sample: 'Projects', script: 'Latin', flag: '🇬🇧' },
                  { lang: 'Afaan Oromoo', native: 'Afaan Oromoo', sample: 'Pirojektota', script: 'Latin', flag: '🇪🇹' },
                  { lang: 'Tigrinya', native: 'ትግርኛ', sample: 'ፕሮጀክትታት', script: 'Ge\'ez', flag: '🇪🇹' },
                ].map((l) => (
                  <div key={l.lang} className="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-[#1C8C7D]/30 hover:shadow-md">
                    <div className="mb-3 text-2xl">{l.flag}</div>
                    <div className="mb-1 text-sm font-semibold text-gray-900">{l.native}</div>
                    <div className="mb-3 text-xs text-gray-500">{l.script} script</div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
                      {l.sample}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5">
                <Globe className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600">Multilingual</span>
              </div>

              <h2 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Your language, your way
              </h2>

              <p className="mb-8 text-lg leading-relaxed text-gray-600">
                Every single element of the interface is available in Amharic, Afaan Oromoo,
                Tigrinya, and English. Switch instantly, work naturally.
              </p>

              <ul className="space-y-4">
                {[
                  'Full UI translation with native Ge\'ez script support',
                  'Instant language switching with one click',
                  'Culturally adapted — not just translated',
                  'Notifications and emails in your preferred language',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1C8C7D]" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRODUCT DEEP-DIVE: Workflow Automation ===== */}
      <section className="overflow-hidden border-y border-gray-100 bg-gray-50/80 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div
            id="automation-section"
            data-animate
            className={`grid items-center gap-16 lg:grid-cols-2 transition-all duration-700 ${
              isVisible('automation-section') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-1.5">
                <Workflow className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-600">Automation</span>
              </div>

              <h2 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Automate the busywork
              </h2>

              <p className="mb-8 text-lg leading-relaxed text-gray-600">
                Build powerful workflow automations without code. Set triggers, define conditions,
                and chain actions to keep your team moving.
              </p>

              <ul className="space-y-4">
                {[
                  '9 trigger types: created, completed, status change, and more',
                  'Conditional logic with field-based filtering',
                  'Actions: notify, email, assign, change status, webhook',
                  'Visual workflow designer — no coding required',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1C8C7D]" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Automation Visual */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-purple-100/50 to-transparent blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
                  <span className="text-sm font-semibold text-gray-700">Workflow Builder</span>
                </div>
                <div className="p-6 space-y-4">
                  {/* Trigger */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                      <Zap className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-3">
                      <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">When</div>
                      <div className="text-sm font-medium text-gray-900">Issue status changes to &quot;Done&quot;</div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <div className="h-6 w-px bg-gray-300" />
                  </div>

                  {/* Condition */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                      <Target className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1 rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3">
                      <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">If</div>
                      <div className="text-sm font-medium text-gray-900">Priority is &quot;High&quot; or &quot;Highest&quot;</div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <div className="h-6 w-px bg-gray-300" />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                      <Bell className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 rounded-lg border border-green-200 bg-green-50/50 px-4 py-3">
                      <div className="text-xs font-semibold text-green-600 uppercase tracking-wider">Then</div>
                      <div className="text-sm font-medium text-gray-900">Send Slack notification to #releases</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 rounded-lg border border-green-200 bg-green-50/50 px-4 py-3">
                      <div className="text-xs font-semibold text-green-600 uppercase tracking-wider">And</div>
                      <div className="text-sm font-medium text-gray-900">Email the reporter with completion update</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div
            id="stats-section"
            data-animate
            className={`transition-all duration-700 ${
              isVisible('stats-section') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Teams ship faster with Onekof
              </h2>
              <p className="text-lg text-gray-600">
                Join hundreds of Ethiopian teams already using Onekof to deliver better products.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {[
                { value: '500+', label: 'Active teams', sublabel: 'across Ethiopia' },
                { value: '40%', label: 'Faster delivery', sublabel: 'average improvement' },
                { value: '99.9%', label: 'Uptime', sublabel: 'enterprise reliability' },
                { value: '4', label: 'Languages', sublabel: 'native support' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="mb-2 text-4xl font-bold tracking-tight text-[#1C8C7D] sm:text-5xl">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{stat.label}</div>
                  <div className="text-sm text-gray-500">{stat.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="border-y border-gray-100 bg-gray-50/80 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div
            id="pricing-section"
            data-animate
            className={`transition-all duration-700 ${
              isVisible('pricing-section') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#1C8C7D]">
                Pricing
              </p>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-gray-600">
                Start free. Scale as you grow. No hidden fees.
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
              {[
                {
                  name: 'Free',
                  price: '0',
                  currency: 'ETB',
                  description: 'For small teams getting started',
                  features: [
                    'Up to 10 users',
                    'Unlimited projects',
                    'Ethiopian calendar',
                    '4 language support',
                    'Basic analytics',
                    'Community support',
                  ],
                  cta: 'Get started',
                  highlighted: false,
                },
                {
                  name: 'Pro',
                  price: '499',
                  currency: 'ETB',
                  description: 'For growing teams that need more',
                  features: [
                    'Unlimited users',
                    'Workflow automation',
                    'Advanced analytics',
                    'Gantt charts',
                    'API access',
                    'Priority support',
                    'Custom fields',
                    'Export & reporting',
                  ],
                  cta: 'Start free trial',
                  highlighted: true,
                },
                {
                  name: 'Enterprise',
                  price: 'Custom',
                  currency: '',
                  description: 'For large organizations',
                  features: [
                    'Everything in Pro',
                    'SSO & SAML',
                    'Audit logs',
                    'Dedicated support',
                    'SLA guarantee',
                    'Custom integrations',
                    'On-premise option',
                  ],
                  cta: 'Contact sales',
                  highlighted: false,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border p-8 transition-shadow ${
                    plan.highlighted
                      ? 'border-[#1C8C7D] bg-white shadow-xl ring-1 ring-[#1C8C7D]/10'
                      : 'border-gray-200 bg-white hover:shadow-md'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#1C8C7D] px-4 py-1 text-xs font-semibold text-white">
                      Most popular
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="mb-1 text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                  <div className="mb-6">
                    {plan.price === 'Custom' ? (
                      <span className="text-4xl font-bold text-gray-900">Custom</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="ml-1 text-sm text-gray-500">{plan.currency}/user/mo</span>
                      </>
                    )}
                  </div>
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#1C8C7D]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.name === 'Enterprise' ? '#about' : '/auth/signup'}
                    className={`block rounded-lg py-3 text-center text-sm font-semibold transition-all ${
                      plan.highlighted
                        ? 'bg-[#1C8C7D] text-white shadow-sm hover:bg-[#15725f]'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div
            id="testimonials-section"
            data-animate
            className={`transition-all duration-700 ${
              isVisible('testimonials-section') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Loved by teams across Ethiopia
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  quote:
                    'Finally, a project management tool that understands how we work. The Ethiopian calendar alone saved us hours of confusion every sprint.',
                  name: 'Abebe Kebede',
                  role: 'Engineering Lead, TechEthio',
                  initials: 'AK',
                },
                {
                  quote:
                    'Switching from Jira to Onekof was the best decision we made. Our team adopted it in a day because everything is in Amharic.',
                  name: 'Sara Tesfaye',
                  role: 'Product Manager, Ride',
                  initials: 'ST',
                },
                {
                  quote:
                    'The automation workflows save us 10+ hours a week. And the pricing in ETB makes budgeting straightforward for once.',
                  name: 'Dawit Mekonnen',
                  role: 'CTO, Gebeta Maps',
                  initials: 'DM',
                },
              ].map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <p className="mb-6 text-sm leading-relaxed text-gray-600">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1C8C7D] text-sm font-semibold text-white">
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div
            id="cta-section"
            data-animate
            className={`py-24 text-center sm:py-32 transition-all duration-700 ${
              isVisible('cta-section') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Ready to transform how your team works?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-gray-600">
              Join 500+ Ethiopian teams already shipping faster with Onekof. Free to start, no credit card required.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#1C8C7D] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#1C8C7D]/20 transition-all hover:bg-[#15725f] hover:shadow-xl"
              >
                Get started for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#about"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-900 transition-all hover:border-gray-400 hover:bg-gray-50"
              >
                Talk to sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer id="about" className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1C8C7D]">
                  <span className="text-base font-bold text-white">O</span>
                </div>
                <span className="text-lg font-bold text-gray-900">Onekof</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">
                The project management platform built for Ethiopian teams.
                Plan, track, and ship — in your language.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Product
              </h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Changelog', 'API Docs', 'Status'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Company
              </h4>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers', 'Contact', 'Partners'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Legal
              </h4>
              <ul className="space-y-3">
                {['Privacy Policy', 'Terms of Service', 'Security', 'GDPR'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 py-8 sm:flex-row">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Onekof. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <span>Made with</span>
              <span className="text-[#1C8C7D]">&hearts;</span>
              <span>in Ethiopia</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Play,
  Calendar,
  Globe,
  Sparkles,
  TrendingUp,
  Users,
  Star,
  ChevronRight,
  ChevronDown,
  Zap,
  Shield,
  Clock,
  BarChart3,
  MessageSquare,
  Check,
} from 'lucide-react';

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [activeTask, setActiveTask] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    // Simulate live activity
    const interval = setInterval(() => {
      setActiveTask((prev) => (prev + 1) % 3);
    }, 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative bg-white">
      {/* Premium Navigation - Brand Colors */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-900/5 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left - Logo & Nav Links */}
            <div className="flex items-center gap-10">
              <Link href="/" className="group flex items-center gap-2.5">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#1C8C7D] via-[#156B60] to-[#1C8C7D] opacity-75 blur-lg transition-all group-hover:opacity-100" />
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1C8C7D] to-[#156B60]">
                    <span className="text-lg font-bold text-white">O</span>
                  </div>
                </div>
                <span className="text-xl font-bold text-gray-900">Onekof</span>
              </Link>
              <div className="hidden items-center gap-7 lg:flex">
                <a href="#features" className="relative text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
                  Features
                </a>
                <a href="#pricing" className="relative text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
                  Pricing
                </a>
                <a href="#testimonials" className="relative text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
                  Customers
                </a>
                <a href="#faq" className="relative text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
                  FAQ
                </a>
              </div>
            </div>

            {/* Right - Language Selector, Sign In, CTA */}
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
                >
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="hidden sm:inline">{selectedLanguage}</span>
                  <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isLanguageOpen ? 'rotate-90' : 'rotate-0'}`} />
                </button>

                {isLanguageOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                    {[
                      'English',
                      'አማርኛ',
                      'Afaan Oromoo',
                      'ትግርኛ',
                    ].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setSelectedLanguage(lang);
                          setIsLanguageOpen(false);
                        }}
                        className={`flex w-full items-center justify-center px-4 py-3 text-center text-sm transition-colors ${
                          selectedLanguage === lang
                            ? 'bg-[#1C8C7D]/10 text-[#1C8C7D] font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/auth/signin" className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 sm:inline">
                Sign in
              </Link>
              <Link href="/auth/signup" className="group relative overflow-hidden rounded-lg bg-[#1C8C7D] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#1C8C7D]/20 transition-all hover:shadow-xl hover:shadow-[#1C8C7D]/30">
                <span className="relative z-10">Get started free</span>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#1C8C7D] via-[#156B60] to-[#1C8C7D] bg-[length:200%_100%] transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Brand Aligned */}
      <section className="relative overflow-hidden bg-white pt-16">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(28,140,125,0.08)_0%,transparent_50%),radial-gradient(circle_at_70%_60%,rgba(21,107,96,0.05)_0%,transparent_50%)]" />
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231C8C7D' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          {/* Hero Content Grid */}
          <div className="grid items-center gap-16 pt-12 pb-16 lg:grid-cols-2 lg:gap-20 lg:pt-20 lg:pb-24">
            {/* Left Column - Message */}
            <div className="mx-auto max-w-xl lg:mx-0">
              {/* Announcement Badge */}
              <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#1C8C7D]/20 bg-[#1C8C7D]/5 px-4 py-2 backdrop-blur-sm">
                <div className="flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[#1C8C7D] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1C8C7D]" />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  🇪🇹 Built in Ethiopia, for Ethiopia
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="mb-8 text-4xl font-semibold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                The only PM tool
                <br />
                that speaks{' '}
                <span className="text-[#1C8C7D]">your language</span>
              </h1>

              {/* Subheadline */}
              <p className="mb-10 text-base leading-relaxed text-gray-600 sm:text-lg lg:text-xl">
                Ethiopian calendar. 4 native languages. AI-powered workflows.
                <strong className="text-gray-900"> Stop adapting to foreign tools.</strong> Use software built for how Ethiopians work.
              </p>

              {/* CTA Buttons */}
              <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link href="/auth/signup" className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#1C8C7D] px-7 py-4 text-base font-semibold text-white shadow-lg shadow-[#1C8C7D]/25 transition-all hover:bg-[#156B60] hover:shadow-xl hover:shadow-[#1C8C7D]/30">
                  Start building for free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <button className="group inline-flex items-center justify-center gap-2.5 rounded-xl border-2 border-gray-200 bg-white px-7 py-4 text-base font-semibold text-gray-900 transition-all hover:border-gray-300 hover:bg-gray-50">
                  <Play className="h-5 w-5 fill-current" />
                  Watch 2-min demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-green-600" />
                    <span className="font-medium">Free forever for 10 users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-green-600" />
                    <span className="font-medium">No credit card needed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-green-600" />
                    <span className="font-medium">Ready in 2 minutes</span>
                  </div>
                </div>

                {/* Social Proof */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-teal-400 to-teal-600"
                      />
                    ))}
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900">500+ Ethiopian teams</div>
                    <div className="text-gray-600">shipping faster every day</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Product Showcase */}
            <div className="relative lg:ml-auto lg:w-full">
              {/* Premium Glow Effect */}
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-[#1C8C7D]/30 via-teal-500/10 to-emerald-500/20 opacity-60 blur-3xl" />

              {/* Product Screenshot */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-gray-900/10 bg-white shadow-[0_20px_70px_-10px_rgba(28,140,125,0.3)] ring-1 ring-gray-900/5">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 border-b border-gray-200 bg-gradient-to-b from-gray-100 to-gray-50 px-4 py-3.5">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-gray-300" />
                    <div className="h-3 w-3 rounded-full bg-gray-300" />
                    <div className="h-3 w-3 rounded-full bg-gray-300" />
                  </div>
                  <div className="ml-3 flex-1 rounded-md bg-white px-3 py-1.5 text-xs text-gray-500">
                    app.onekof.com
                  </div>
                </div>

                {/* Dashboard Preview */}
                <div className="bg-[#1B1F23] p-6">
                  {/* Top Bar */}
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">Mobile App Launch</h3>
                      <p className="text-sm text-gray-400">12 tasks • 4 team members • የካቲት 20</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg bg-[#1C8C7D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#156B60]">
                        Add task
                      </button>
                    </div>
                  </div>

                  {/* Kanban Columns */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* To Do Column */}
                    <div className="rounded-lg bg-[#262B30] p-3 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-300">To Do</span>
                        <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-300">3</span>
                      </div>
                      <div className="space-y-2">
                        <div className="group cursor-pointer rounded-lg border border-gray-700 bg-[#2C3137] p-3 transition-all hover:border-[#1C8C7D]">
                          <div className="mb-2 text-sm font-medium text-white">የተጠቃሚ በይነገጽ ንድፍ</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600" />
                            </div>
                            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                              Design
                            </span>
                          </div>
                        </div>

                        <div className="group cursor-pointer rounded-lg border border-gray-700 bg-[#2C3137] p-3 transition-all hover:border-[#1C8C7D]">
                          <div className="mb-2 text-sm font-medium text-white">API Integration</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-green-400 to-green-600" />
                            </div>
                            <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-400">
                              Dev
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* In Progress Column */}
                    <div className="rounded-lg bg-[#262B30] p-3 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-300">In Progress</span>
                        <span className="rounded-full bg-[#1C8C7D]/20 px-2 py-0.5 text-xs font-medium text-[#1C8C7D]">2</span>
                      </div>
                      <div className="space-y-2">
                        <div className="relative rounded-lg border-2 border-[#1C8C7D] bg-[#2C3137] p-3 shadow-sm">
                          <div className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1C8C7D] opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1C8C7D]" />
                          </div>
                          <div className="mb-2 text-sm font-medium text-white">Payment Gateway</div>
                          <div className="mb-2">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
                              <div className="h-full w-2/3 rounded-full bg-[#1C8C7D]" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600" />
                            <span className="text-xs font-medium text-gray-400">67%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Done Column */}
                    <div className="rounded-lg bg-[#262B30] p-3 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-300">Done</span>
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">5</span>
                      </div>
                      <div className="space-y-2">
                        <div className="group cursor-pointer rounded-lg border border-gray-700 bg-[#2C3137] p-3 opacity-75 transition-all hover:opacity-100">
                          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Database Schema</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-rose-400 to-rose-600" />
                            <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                              ✓ Done
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Feed Preview */}
                  <div className="mt-4 rounded-lg border border-gray-700 bg-[#262B30] p-3">
                    <div className="mb-2 text-xs font-semibold text-gray-400">RECENT ACTIVITY</div>
                    <div className="space-y-2 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#1C8C7D]" />
                        <span><strong className="text-white">Sarah</strong> moved "Payment Gateway" to In Progress</span>
                        <span className="ml-auto text-gray-500">2m ago</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span><strong className="text-white">Ahmed</strong> completed "Database Schema"</span>
                        <span className="ml-auto text-gray-500">5m ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Badges */}
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-lg border border-[#1C8C7D]/20 bg-[#1C8C7D]/5 px-3 py-2 text-xs font-medium text-[#1C8C7D] shadow-sm">
                  🇪🇹 Ethiopian Calendar
                </div>
                <div className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-medium text-purple-700 shadow-sm">
                  ✨ AI-Powered
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 shadow-sm">
                  🌍 4 Languages
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center pt-12 pb-8">
            <a
              href="#social-proof"
              className="group flex flex-col items-center gap-3 transition-all hover:gap-4"
            >
              <span className="text-sm font-medium text-gray-600 transition-colors group-hover:text-gray-900">
                Scroll to explore
              </span>
              <div className="relative flex h-14 w-9 items-start justify-center rounded-full border-2 border-gray-400 bg-white p-2.5 shadow-sm transition-all group-hover:border-[#1C8C7D] group-hover:shadow-md">
                <div className="h-3 w-3 animate-bounce rounded-full bg-[#1C8C7D] shadow-lg transition-all"
                     style={{ animationDuration: '1.5s' }} />
              </div>
              <ChevronDown className="h-5 w-5 animate-bounce text-[#1C8C7D] transition-all group-hover:text-[#156B60]"
                          style={{ animationDuration: '1.5s', animationDelay: '0.1s' }} />
            </a>
          </div>
        </div>
      </section>

      {/* Social Proof - Ethiopian Companies */}
      <section id="social-proof" className="border-y border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="mb-10 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
            Trusted by leading Ethiopian organizations
          </p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { name: 'Ethio Telecom', initials: 'ET', color: 'bg-orange-500' },
              { name: 'Commercial Bank', initials: 'CB', color: 'bg-green-600' },
              { name: 'Ethiopian Airlines', initials: 'EA', color: 'bg-red-600' },
              { name: 'Safaricom Ethiopia', initials: 'SF', color: 'bg-emerald-500' }
            ].map((company) => (
              <div key={company.name} className="flex items-center justify-center transition-all hover:scale-105">
                <div className={`flex flex-col items-center justify-center w-32 h-32 rounded-2xl ${company.color} shadow-md hover:shadow-xl transition-all`}>
                  <div className="text-4xl font-bold text-white">{company.initials}</div>
                  <div className="mt-1 text-xs font-medium text-white/80 uppercase tracking-wider">{company.name.split(' ')[0]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Proof of Value */}
      <section className="bg-gradient-to-br from-[#1C8C7D] to-[#156B60] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { value: '500+', label: 'Ethiopian Teams', icon: Users },
              { value: '50K+', label: 'Tasks Completed', icon: CheckCircle2 },
              { value: '42%', label: 'Faster Shipping', icon: TrendingUp },
              { value: '99.9%', label: 'Uptime SLA', icon: Shield },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto mb-3 h-8 w-8 text-white/80" />
                <div className="mb-2 text-4xl font-bold text-white">{stat.value}</div>
                <div className="text-sm font-medium text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-green-50/50 py-20">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Everything Ethiopian teams need
            </h2>
            <p className="mx-auto max-w-2xl text-base text-gray-600">
              Purpose-built for Ethiopia. Features you won't find in Jira, Asana, or Monday.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid gap-12 lg:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: 'Ethiopian Calendar Native',
                description: 'Plan sprints in የካቲት, not February. Set deadlines in መጋቢት, not March. The only PM tool with full የኢትዮጵያ ቀን መቁጠሪያ support.',
                color: 'text-[#1C8C7D]',
                bgColor: 'bg-[#1C8C7D]/10',
              },
              {
                icon: Globe,
                title: '4 Languages Built-In',
                description: 'Amharic, Afaan Oromoo, Tigrinya, English. Perfect script rendering. Per-user language preferences. Your team, your language.',
                color: 'text-amber-600',
                bgColor: 'bg-amber-100',
              },
              {
                icon: Sparkles,
                title: 'AI-Powered Everything',
                description: 'Claude AI turns ideas into tasks, meetings into summaries, chaos into clarity. Auto-generate work breakdowns in any language.',
                color: 'text-purple-600',
                bgColor: 'bg-purple-100',
              },
              {
                icon: Zap,
                title: 'Built for Speed',
                description: 'Hosted in Ethiopia. Lightning-fast load times. Offline mode for unreliable connections. Built for real Ethiopian internet.',
                color: 'text-blue-600',
                bgColor: 'bg-blue-100',
              },
              {
                icon: Shield,
                title: 'Data Stays in Ethiopia',
                description: 'Your data never leaves the country. GDPR compliant. SOC 2 certified. Bank-grade encryption. Ethiopian data protection laws.',
                color: 'text-green-600',
                bgColor: 'bg-green-100',
              },
              {
                icon: MessageSquare,
                title: 'Real-Time Collaboration',
                description: 'Comments, mentions, notifications. File sharing. Screen recording. Everything your team needs to stay in sync—in real time.',
                color: 'text-pink-600',
                bgColor: 'bg-pink-100',
              },
            ].map((feature) => (
              <div key={feature.title} className="group rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-[#1C8C7D] hover:shadow-lg">
                <div className={`mb-4 inline-flex rounded-xl ${feature.bgColor} p-3`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              What Ethiopian teams say
            </h2>
            <p className="mx-auto max-w-2xl text-base text-gray-600">
              Real feedback from teams shipping real products
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                quote: "Finally, a PM tool that understands our calendar! Planning sprints in የካቲት instead of converting dates manually saves us hours every week.",
                author: "Abebe Kebede",
                role: "Engineering Manager",
                company: "Ethiopian Tech Startup",
                rating: 5,
              },
              {
                quote: "The multi-language support is a game-changer. Our team works in Amharic and Afaan Oromoo seamlessly. No more language barriers.",
                author: "Hanna Tessema",
                role: "Product Lead",
                company: "Addis Software House",
                rating: 5,
              },
              {
                quote: "We switched from Jira. Onekof is faster, cheaper, and actually built for how we work. The AI features alone save us 10+ hours per week.",
                author: "Samuel Tadesse",
                role: "CTO",
                company: "Ethiopian Fintech",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                <p className="mb-6 text-gray-700 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#1C8C7D] to-[#156B60]" />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 py-20">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto max-w-2xl text-base text-gray-600">
              Start free. Upgrade when you're ready. No hidden fees. Cancel anytime.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Free Plan */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Free</h3>
                <p className="mt-2 text-gray-600">Perfect for small teams getting started</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="mb-8 space-y-3">
                {[
                  'Up to 10 team members',
                  'Unlimited projects',
                  'Ethiopian calendar',
                  '4 languages',
                  'Basic AI features',
                  'Community support',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#1C8C7D]" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block w-full rounded-lg border-2 border-gray-200 bg-white px-6 py-3 text-center font-semibold text-gray-900 transition-all hover:border-gray-300 hover:bg-gray-50">
                Start for free
              </Link>
            </div>

            {/* Pro Plan - Highlighted */}
            <div className="relative rounded-2xl border-2 border-[#1C8C7D] bg-white p-8 shadow-xl">
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="rounded-full bg-[#1C8C7D] px-4 py-1 text-sm font-semibold text-white">
                  Most Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
                <p className="mt-2 text-gray-600">For growing teams that need more</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">$8</span>
                <span className="text-gray-600">/user/month</span>
              </div>
              <ul className="mb-8 space-y-3">
                {[
                  'Unlimited team members',
                  'Everything in Free, plus:',
                  'Advanced AI features',
                  'Priority support',
                  'Custom workflows',
                  'Advanced analytics',
                  'API access',
                  'SSO authentication',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#1C8C7D]" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block w-full rounded-lg bg-[#1C8C7D] px-6 py-3 text-center font-semibold text-white transition-all hover:bg-[#156B60]">
                Start free trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
                <p className="mt-2 text-gray-600">For large organizations</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">Custom</span>
              </div>
              <ul className="mb-8 space-y-3">
                {[
                  'Everything in Pro, plus:',
                  'Dedicated account manager',
                  'Custom integrations',
                  'On-premise deployment',
                  'SLA guarantee',
                  'Advanced security',
                  'Training & onboarding',
                  'Custom contract',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-[#1C8C7D]" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="#contact" className="block w-full rounded-lg border-2 border-[#1C8C7D] bg-white px-6 py-3 text-center font-semibold text-[#1C8C7D] transition-all hover:bg-[#1C8C7D] hover:text-white">
                Contact sales
              </Link>
            </div>
          </div>

          {/* Pricing FAQ */}
          <div className="mt-16 text-center">
            <p className="text-gray-600">
              All plans include Ethiopian calendar, 4 languages, and unlimited projects.{' '}
              <a href="#faq" className="font-semibold text-[#1C8C7D] hover:underline">
                See FAQ
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1C8C7D] to-[#156B60] py-20">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Success Stories */}
            <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-12 w-12 rounded-full border-2 border-white bg-gradient-to-br from-teal-400 to-green-400"
                  />
                ))}
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-1 justify-center">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-white text-white" />
                  ))}
                </div>
                <p className="mt-1 text-sm font-medium text-white/90">
                  Loved by 500+ teams across Ethiopia
                </p>
              </div>
            </div>

            <h2 className="mb-6 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to build the future
              <br />
              of Ethiopian tech?
            </h2>
            <p className="mb-12 text-base leading-relaxed text-white/90 sm:text-lg">
              Join hundreds of Ethiopian teams shipping faster with tools built for how they work.
              <br />
              Start free. No credit card. Ready in 2 minutes.
            </p>

            {/* CTA Buttons */}
            <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup" className="group inline-flex items-center gap-3 rounded-xl bg-white px-10 py-5 text-lg font-semibold text-[#1C8C7D] shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                Start building for free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#pricing" className="inline-flex items-center gap-3 rounded-xl border-2 border-white bg-transparent px-10 py-5 text-lg font-semibold text-white transition-all hover:bg-white hover:text-[#1C8C7D]">
                See pricing
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Free for 10 users</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden border-t border-gray-900/5 bg-gradient-to-br from-slate-100 via-gray-50 to-teal-50/30 py-20">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1C8C7D] to-[#156B60]">
                  <span className="text-lg font-bold text-white">O</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Onekof</span>
              </div>
              <p className="mb-6 max-w-md text-sm leading-relaxed text-gray-600">
                The first project management platform built specifically for Ethiopian teams.
                Ethiopian calendar. 4 native languages. AI-powered workflows.
                Built in Ethiopia, for Ethiopia.
              </p>
              <p className="text-sm text-gray-600">
                🇪🇹 Proudly built in Addis Ababa
              </p>
            </div>
            {[
              { title: 'Product', links: [
                { name: 'Features', href: '#features' },
                { name: 'Pricing', href: '#pricing' },
                { name: 'Security', href: '#' },
                { name: 'Roadmap', href: '#' }
              ]},
              { title: 'Company', links: [
                { name: 'About', href: '#' },
                { name: 'Blog', href: '#' },
                { name: 'Careers', href: '#' },
                { name: 'Contact', href: '#' }
              ]},
            ].map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-sm font-bold text-gray-900">{col.title}</h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-gray-900/5 pt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2026 Onekof. All rights reserved. Made with ❤️ in Ethiopia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

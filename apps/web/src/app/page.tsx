'use client';

import { useState, useEffect } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Play,
  Calendar,
  Globe,
  Sparkles,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  Users,
  MessageSquare,
  Bell,
  Search,
  Plus,
  MoreHorizontal,
  Star,
  Paperclip,
  Image as ImageIcon,
  Send,
  ChevronRight,
  Mouse,
  ChevronDown,
} from 'lucide-react';

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTask, setActiveTask] = useState(0);
  const [messageCount, setMessageCount] = useState(3);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    // Simulate live activity
    const interval = setInterval(() => {
      setActiveTask((prev) => (prev + 1) % 3);
      if (Math.random() > 0.7) {
        setMessageCount((prev) => prev + 1);
      }
    }, 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative bg-white">
      {/* Enhanced Premium Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-900/5 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left - Logo & Nav Links */}
            <div className="flex items-center gap-10">
              <a href="/" className="group flex items-center gap-2.5">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#0EA5E9] via-[#0284C7] to-[#F59E0B] opacity-75 blur-lg transition-all group-hover:opacity-100" />
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7]">
                    <span className="text-lg font-bold text-white">O</span>
                  </div>
                </div>
                <span className="font-sans text-xl font-bold text-gray-900">Onekof</span>
              </a>
              <div className="hidden items-center gap-7 lg:flex">
                <a href="#product" className="font-sans relative text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
                  Product
                </a>
                <a href="#features" className="font-sans relative text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
                  Features
                </a>
                <a href="#pricing" className="font-sans relative text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
                  Pricing
                </a>
                <a href="#customers" className="font-sans relative text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">
                  Customers
                </a>
              </div>
            </div>

            {/* Right - Language Selector, Sign In, CTA */}
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="font-sans flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
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
                        className={`font-sans flex w-full items-center justify-center px-4 py-3 text-center text-sm transition-colors ${
                          selectedLanguage === lang
                            ? 'bg-[#0EA5E9]/10 text-[#0EA5E9] font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <a href="#" className="font-sans hidden text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 sm:inline">
                Sign in
              </a>
              <button className="font-sans group relative overflow-hidden rounded-lg bg-[#0EA5E9] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#0EA5E9]/20 transition-all hover:shadow-xl hover:shadow-[#0EA5E9]/30">
                <span className="relative z-10">Get started</span>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0EA5E9] via-[#0284C7] to-[#0EA5E9] bg-[length:200%_100%] transition-all group-hover:animate-gradient" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Exceptional First Impression */}
      <section className="relative overflow-hidden bg-white pt-16">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.05)_0%,transparent_50%),radial-gradient(circle_at_70%_60%,rgba(245,158,11,0.03)_0%,transparent_50%)]" />
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
          {/* Hero Content Grid */}
          <div className="grid items-center gap-16 pt-12 pb-16 lg:grid-cols-2 lg:gap-20 lg:pt-20 lg:pb-24">
            {/* Left Column - Message */}
            <div className="mx-auto max-w-xl lg:mx-0">
              {/* Announcement Badge */}
              <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#0EA5E9]/20 bg-[#0EA5E9]/5 px-4 py-2 backdrop-blur-sm">
                <div className="flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[#0EA5E9] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0EA5E9]" />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  Now with Claude AI integration
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="mb-8 text-4xl font-semibold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Project management
                <br />
                built for{' '}
                <span className="text-[#0EA5E9]">Ethiopia</span>
              </h1>

              {/* Subheadline */}
              <p className="mb-10 text-base leading-relaxed text-gray-600 sm:text-lg lg:text-xl">
                The only platform with Ethiopian calendar, 4 native languages, and AI-powered workflows.
                Everything your team needs—nothing you don't.
              </p>

              {/* CTA Buttons */}
              <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <button className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#0EA5E9] px-7 py-4 text-base font-semibold text-white shadow-lg shadow-[#0EA5E9]/25 transition-all hover:bg-[#0284C7] hover:shadow-xl hover:shadow-[#0EA5E9]/30">
                  Start building for free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </button>
                <button className="group inline-flex items-center justify-center gap-2.5 rounded-xl border-2 border-gray-200 bg-white px-7 py-4 text-base font-semibold text-gray-900 transition-all hover:border-gray-300 hover:bg-gray-50">
                  <Play className="h-5 w-5 fill-current" />
                  Watch demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-green-600" />
                    <span>Free for 10 users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-green-600" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-green-600" />
                    <span>Setup in 2 minutes</span>
                  </div>
                </div>

                {/* Social Proof */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-500"
                      />
                    ))}
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900">500+ teams</div>
                    <div className="text-gray-600">are shipping faster</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Product Showcase */}
            <div className="relative lg:ml-auto lg:w-full">
              {/* Premium Glow Effect */}
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-[#0EA5E9]/30 via-purple-500/10 to-[#F59E0B]/20 opacity-60 blur-3xl" />

              {/* Product Screenshot - Premium Border Treatment */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-gray-900/10 bg-white shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] ring-1 ring-gray-900/5">
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
                <div className="bg-gray-50 p-6">
                  {/* Top Bar */}
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Mobile App Launch</h3>
                      <p className="text-sm text-gray-500">12 tasks • 4 team members</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg bg-[#0EA5E9] px-4 py-2 text-sm font-semibold text-white">
                        Add task
                      </button>
                    </div>
                  </div>

                  {/* Kanban Columns */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* To Do Column */}
                    <div className="rounded-lg bg-white p-3 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">To Do</span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">3</span>
                      </div>
                      <div className="space-y-2">
                        <div className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md">
                          <div className="mb-2 text-sm font-medium text-gray-900">የተጠቃሚ በይነገጽ ንድፍ</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-400 to-purple-600" />
                            </div>
                            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              Design
                            </span>
                          </div>
                        </div>

                        <div className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md">
                          <div className="mb-2 text-sm font-medium text-gray-900">API Integration</div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-green-400 to-green-600" />
                            </div>
                            <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                              Dev
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* In Progress Column */}
                    <div className="rounded-lg bg-white p-3 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">In Progress</span>
                        <span className="rounded-full bg-[#0EA5E9]/10 px-2 py-0.5 text-xs font-medium text-[#0EA5E9]">2</span>
                      </div>
                      <div className="space-y-2">
                        <div className="relative rounded-lg border-2 border-[#0EA5E9] bg-white p-3 shadow-sm">
                          <div className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0EA5E9] opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0EA5E9]" />
                          </div>
                          <div className="mb-2 text-sm font-medium text-gray-900">Payment Gateway</div>
                          <div className="mb-2">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                              <div className="h-full w-2/3 rounded-full bg-[#0EA5E9]" />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600" />
                            <span className="text-xs font-medium text-gray-500">67%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Done Column */}
                    <div className="rounded-lg bg-white p-3 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Done</span>
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">5</span>
                      </div>
                      <div className="space-y-2">
                        <div className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-3 opacity-75 transition-all hover:opacity-100">
                          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-900">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>Database Schema</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-rose-400 to-rose-600" />
                            <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              ✓ Done
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Feed Preview */}
                  <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3">
                    <div className="mb-2 text-xs font-semibold text-gray-500">RECENT ACTIVITY</div>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#0EA5E9]" />
                        <span><strong>Sarah</strong> moved "Payment Gateway" to In Progress</span>
                        <span className="ml-auto text-gray-400">2m ago</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                        <span><strong>Ahmed</strong> completed "Database Schema"</span>
                        <span className="ml-auto text-gray-400">5m ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Badges */}
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm">
                  🇪🇹 Ethiopian Calendar
                </div>
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm">
                  ✨ AI-Powered
                </div>
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm">
                  🌍 4 Languages
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center pt-12 pb-8">
            <a
              href="#features"
              className="group flex flex-col items-center gap-3 transition-all hover:gap-4"
            >
              <span className="font-sans text-sm font-medium text-gray-600 transition-colors group-hover:text-gray-900">
                Scroll to explore
              </span>
              <div className="relative flex h-14 w-9 items-start justify-center rounded-full border-2 border-gray-400 bg-white p-2.5 shadow-sm transition-all group-hover:border-[#0EA5E9] group-hover:shadow-md">
                <div className="h-3 w-3 animate-bounce rounded-full bg-[#0EA5E9] shadow-lg transition-all"
                     style={{ animationDuration: '1.5s' }} />
              </div>
              <ChevronDown className="h-5 w-5 animate-bounce text-[#0EA5E9] transition-all group-hover:text-[#0284C7]"
                          style={{ animationDuration: '1.5s', animationDelay: '0.1s' }} />
            </a>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="features" className="border-y border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="font-sans mb-10 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
            Trusted by leading Ethiopian organizations
          </p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { name: 'Ethio Telecom', initials: 'ET', color: 'bg-orange-500' },
              { name: 'Commercial Bank', initials: 'CB', color: 'bg-green-600' },
              { name: 'Ethiopian Airlines', initials: 'EA', color: 'bg-red-600' },
              { name: 'Safaricom', initials: 'SF', color: 'bg-emerald-500' }
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

      {/* Features Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100/50 py-20">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-1/4 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-[#0EA5E9]/20 to-transparent blur-3xl" />
          <div className="absolute -left-1/4 bottom-0 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-200/30 to-transparent blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Everything your team needs
            </h2>
            <p className="mx-auto max-w-2xl text-base text-gray-600">
              Purpose-built for Ethiopian teams with features you won't find anywhere else
            </p>
          </div>

          {/* Feature 1 - Ethiopian Calendar */}
          <div className="grid items-center gap-20 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2">
                <Calendar className="h-4 w-4 text-[#0EA5E9]" />
                <span className="text-sm font-bold text-[#0EA5E9]">Ethiopian Calendar Built-In</span>
              </div>

              <h2 className="mb-6 text-3xl font-semibold tracking-tight text-gray-900 lg:text-4xl">
                Work in your
                <br />
                own time.
              </h2>

              <p className="mb-8 text-base leading-relaxed text-gray-600">
                The only PM tool with native Ethiopian calendar support.
                Plan sprints, set deadlines, track milestones—all in የካቲት, not February.
              </p>

              <ul className="space-y-5">
                {[
                  'Native Ethiopian calendar throughout',
                  'Automatic date conversions',
                  'Ethiopian holidays & working days',
                  'Dual-calendar task scheduling',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0EA5E9]/10">
                      <CheckCircle2 className="h-5 w-5 text-[#0EA5E9]" />
                    </div>
                    <span className="text-lg text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl border-2 border-gray-900/5 bg-white shadow-xl ring-1 ring-gray-900/5">
                {/* Ethiopian Calendar Widget */}
                <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50/30 p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-gray-500">Today</div>
                      <div className="text-3xl font-bold text-gray-900">የካቲት 20, 2017</div>
                      <div className="text-base text-gray-600">February 28, 2026</div>
                    </div>
                    <div className="rounded-xl bg-[#0EA5E9] p-3">
                      <Calendar className="h-7 w-7 text-white" />
                    </div>
                  </div>

                  {/* Mini Calendar */}
                  <div className="rounded-xl bg-white p-5 shadow-sm">
                    <div className="mb-4 text-center text-base font-bold text-gray-900">የካቲት 2017</div>
                    <div className="grid grid-cols-7 gap-2">
                      {['እሑድ', 'ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'].map((day, i) => (
                        <div key={i} className="text-center text-xs font-semibold text-gray-500">
                          {day.slice(0, 1)}
                        </div>
                      ))}
                      {[...Array(30)].map((_, i) => (
                        <div
                          key={i}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                            i + 1 === 20
                              ? 'bg-[#0EA5E9] text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Events */}
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#0EA5E9]" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">Sprint Planning</div>
                        <div className="text-xs text-gray-500">የካቲት 22 • 2:00 PM</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">Demo Day</div>
                        <div className="text-xs text-gray-500">መጋቢት 1 • 10:00 AM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating Metrics Cards */}
              <div
                className="absolute -left-12 top-1/4 hidden rounded-2xl border border-gray-900/10 bg-white p-5 shadow-2xl lg:block"
                style={{
                  transform: `translateY(${scrollY * 0.03}px)`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">+42%</div>
                    <div className="text-xs font-medium text-gray-600">Faster shipping</div>
                  </div>
                </div>
              </div>

              <div
                className="absolute -right-12 bottom-1/4 hidden rounded-2xl border border-gray-900/10 bg-white p-5 shadow-2xl lg:block"
                style={{
                  transform: `translateY(${-scrollY * 0.03}px)`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] shadow-lg shadow-[#F59E0B]/30">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">500+</div>
                    <div className="text-xs font-medium text-gray-600">Active teams</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-y border-gray-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="font-sans mb-12 text-center text-sm font-bold uppercase tracking-wider text-gray-600">
            Powering Ethiopia's most ambitious teams
          </p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { name: 'Ethio Telecom', initials: 'ET', color: 'bg-orange-500' },
              { name: 'Commercial Bank', initials: 'CB', color: 'bg-green-600' },
              { name: 'Ethiopian Airlines', initials: 'EA', color: 'bg-red-600' },
              { name: 'Safaricom', initials: 'SF', color: 'bg-emerald-500' }
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

      {/* Language Feature Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50/30 to-yellow-50 py-20">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#F59E0B]/20 to-transparent blur-3xl" />
          <div className="absolute -right-1/3 bottom-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-amber-300/20 to-transparent blur-3xl" />
          {/* Floating geometric shapes */}
          <div className="absolute right-1/4 top-1/3 h-32 w-32 rotate-12 rounded-3xl bg-gradient-to-br from-[#F59E0B]/10 to-transparent blur-2xl" />
          <div className="absolute left-1/3 bottom-1/3 h-24 w-24 -rotate-12 rounded-2xl bg-gradient-to-tl from-amber-400/10 to-transparent blur-xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          {/* Feature - Language */}
          <div className="grid items-center gap-20 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="overflow-hidden rounded-2xl border border-gray-900/10 bg-white p-8 shadow-2xl">
                {/* Multilingual Interface Mockup */}
                <div className="rounded-xl bg-gradient-to-br from-amber-50 to-white p-6">
                  {/* Language Selector */}
                  <div className="mb-6 flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-[#F59E0B]" />
                      <span className="font-semibold text-gray-900">አማርኛ</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>

                  {/* Task Cards in Different Languages */}
                  <div className="space-y-3">
                    <div className="rounded-lg bg-white p-4 shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-[#0EA5E9]">አማርኛ</span>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-blue-100" />
                          <div className="h-6 w-6 rounded-full bg-green-100" />
                        </div>
                      </div>
                      <h3 className="mb-1 font-semibold text-gray-900">የተጠቃሚ ምዝገባ ገጽ ይፍጠሩ</h3>
                      <p className="text-sm text-gray-600">የመግቢያ እና የምዝገባ ቅጾችን ማከናወን</p>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-[#F59E0B]">Afaan Oromo</span>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-purple-100" />
                        </div>
                      </div>
                      <h3 className="mb-1 font-semibold text-gray-900">Fuula galmee fayyadamaa uumi</h3>
                      <p className="text-sm text-gray-600">Foormii seensaa fi galmee xumuruu</p>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-purple-600">ትግርኛ</span>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-amber-100" />
                        </div>
                      </div>
                      <h3 className="mb-1 font-semibold text-gray-900">ገጽ መምዝገቢ ተጠቃሚ ምፍጣር</h3>
                      <p className="text-sm text-gray-600">ቅጥዕታት መእተዊን መምዝገብን ምዝዛም</p>
                    </div>

                    <div className="rounded-lg bg-white p-4 shadow-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-green-600">English</span>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-red-100" />
                          <div className="h-6 w-6 rounded-full bg-yellow-100" />
                        </div>
                      </div>
                      <h3 className="mb-1 font-semibold text-gray-900">Create user registration page</h3>
                      <p className="text-sm text-gray-600">Complete login and signup forms</p>
                    </div>
                  </div>

                  {/* Language Stats */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white p-3 shadow-sm">
                      <div className="text-2xl font-bold text-[#F59E0B]">4</div>
                      <div className="text-xs text-gray-600">Languages</div>
                    </div>
                    <div className="rounded-lg bg-white p-3 shadow-sm">
                      <div className="text-2xl font-bold text-[#0EA5E9]">100%</div>
                      <div className="text-xs text-gray-600">Coverage</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2">
                <Globe className="h-4 w-4 text-[#F59E0B]" />
                <span className="text-sm font-bold text-[#F59E0B]">4 Languages Built-In</span>
              </div>

              <h2 className="mb-6 text-3xl font-semibold tracking-tight text-gray-900 lg:text-4xl">
                One team.
                <br />
                Many voices.
              </h2>

              <p className="mb-8 text-base leading-relaxed text-gray-600">
                Full support for Amharic, Afaan Oromo, Tigrinya, and English.
                Every team member works in their language—no barriers.
              </p>

              <ul className="space-y-5">
                {[
                  'Perfect Ethiopic script rendering',
                  'Per-user language preferences',
                  'Bi-directional text support',
                  'Localized formats & translations',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F59E0B]/10">
                      <CheckCircle2 className="h-5 w-5 text-[#F59E0B]" />
                    </div>
                    <span className="text-lg text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI Feature Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50/40 to-fuchsia-50/30 py-20">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-1/4 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-400/15 to-transparent blur-3xl" />
          <div className="absolute -left-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-violet-300/15 to-transparent blur-3xl" />
          {/* Floating sparkles effect */}
          <div className="absolute right-1/3 top-1/4 h-24 w-24 rotate-45 rounded-full bg-gradient-to-br from-fuchsia-400/10 to-transparent blur-2xl" />
          <div className="absolute left-1/4 bottom-1/3 h-32 w-32 -rotate-45 rounded-full bg-gradient-to-tl from-purple-300/10 to-transparent blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          {/* Feature - AI */}
          <div className="grid items-center gap-20 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-purple-100/80 px-4 py-2 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-bold text-purple-600">AI-Powered</span>
              </div>

              <h2 className="mb-6 text-3xl font-semibold tracking-tight text-gray-900 lg:text-4xl">
                AI that works
                <br />
                while you sleep.
              </h2>

              <p className="mb-8 text-base leading-relaxed text-gray-600">
                Powered by Claude. Turn ideas into tasks, meetings into summaries,
                chaos into clarity—instantly.
              </p>

              <ul className="space-y-5">
                {[
                  'Generate tasks from descriptions',
                  'Auto-summarize meetings',
                  'Semantic search everything',
                  'Smart suggestions in context',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                      <CheckCircle2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-lg text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-gray-900/10 bg-white p-8 shadow-2xl">
                {/* AI Assistant Interface Mockup */}
                <div className="rounded-xl bg-gradient-to-br from-purple-50 to-white p-6">
                  {/* AI Chat Header */}
                  <div className="mb-6 flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-400">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">AI Assistant</div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                        <span className="text-xs text-gray-500">Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="space-y-4">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#0EA5E9] px-4 py-3">
                        <p className="text-sm text-white">
                          Generate 5 tasks for building a user authentication system
                        </p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-400">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
                        <p className="mb-3 text-sm text-gray-700">
                          I've created 5 tasks for your authentication system:
                        </p>
                        <div className="space-y-2">
                          {[
                            { title: 'Design database schema', status: 'To Do', color: 'bg-gray-200' },
                            { title: 'Implement JWT authentication', status: 'To Do', color: 'bg-gray-200' },
                            { title: 'Create login/signup API', status: 'To Do', color: 'bg-gray-200' },
                            { title: 'Build password reset flow', status: 'To Do', color: 'bg-gray-200' },
                            { title: 'Add OAuth providers', status: 'To Do', color: 'bg-gray-200' },
                          ].map((task, i) => (
                            <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
                              <div className={`h-1.5 w-1.5 rounded-full ${task.color}`} />
                              <span className="flex-1 text-xs text-gray-900">{task.title}</span>
                              <span className="text-xs text-gray-500">{task.status}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <button className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700">
                            Add to Board
                          </button>
                          <button className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200">
                            Modify
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Typing Indicator */}
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-400">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-white p-3 shadow-sm">
                    <input
                      type="text"
                      placeholder="Ask AI anything..."
                      className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                      disabled
                    />
                    <button className="rounded-lg bg-purple-600 p-2 text-white">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Bold & Modern */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-50 via-blue-100/40 to-indigo-50 py-20">
        {/* Modern Abstract Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-1/3 top-1/4 h-[700px] w-[700px] rounded-full bg-gradient-to-br from-[#0EA5E9]/20 to-transparent blur-3xl" />
          <div className="absolute -left-1/4 bottom-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-cyan-300/20 to-transparent blur-3xl" />
          <div className="absolute right-1/4 bottom-1/3 h-40 w-40 rotate-12 rounded-3xl bg-gradient-to-br from-blue-400/10 to-transparent blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          {/* Main CTA Card with Glassmorphism */}
          <div className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-xl">
              {/* Accent Bar */}
              <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-[#0EA5E9] via-[#F59E0B] to-[#0EA5E9]" />
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50/50 via-transparent to-amber-50/30" />

              <div className="px-8 py-20 sm:px-16 sm:py-24">
                {/* Success Stories */}
                <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-12 w-12 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-400"
                      />
                    ))}
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" />
                      ))}
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-600">
                      Loved by 500+ teams across Ethiopia
                    </p>
                  </div>
                </div>

                {/* Headline */}
                <div className="mx-auto max-w-3xl text-center">
                  <h2 className="mb-6 text-3xl font-semibold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                    Join the future of
                    <br />
                    <span className="text-[#0EA5E9]">team collaboration</span>
                  </h2>
                  <p className="mb-12 text-base leading-relaxed text-gray-600 sm:text-lg">
                    Build faster, collaborate better, and ship with confidence.
                    <br />
                    Start your journey with Onekof today.
                  </p>

                  {/* CTA Buttons */}
                  <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button className="group inline-flex items-center gap-3 rounded-xl bg-[#0EA5E9] px-10 py-5 text-lg font-semibold text-white shadow-lg shadow-[#0EA5E9]/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#0EA5E9]/40">
                      Start free trial
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </button>
                    <button className="inline-flex items-center gap-3 rounded-xl border-2 border-gray-900/10 bg-white px-10 py-5 text-lg font-semibold text-gray-900 transition-all hover:border-gray-900/20 hover:bg-gray-50">
                      <Play className="h-5 w-5 fill-current" />
                      Watch demo
                    </button>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Free for 10 users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium">No credit card</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium">2-minute setup</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Stats */}
              <div className="border-t border-gray-900/5 bg-gray-50/50 px-8 py-8">
                <div className="grid gap-8 sm:grid-cols-3">
                  <div className="text-center">
                    <div className="mb-2 text-4xl font-bold text-[#0EA5E9]">500+</div>
                    <div className="text-sm font-medium text-gray-600">Active Teams</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-4xl font-bold text-[#F59E0B]">50K+</div>
                    <div className="text-sm font-medium text-gray-600">Tasks Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-4xl font-bold text-purple-600">99.9%</div>
                    <div className="text-sm font-medium text-gray-600">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-16 text-center">
            <p className="font-sans mb-8 text-sm font-semibold uppercase tracking-wider text-gray-600">
              Trusted by teams at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {[
                { name: 'Company A', initials: 'CA', color: 'bg-blue-600' },
                { name: 'Company B', initials: 'CB', color: 'bg-indigo-600' },
                { name: 'Company C', initials: 'CC', color: 'bg-purple-600' },
                { name: 'Company D', initials: 'CD', color: 'bg-pink-600' },
                { name: 'Company E', initials: 'CE', color: 'bg-cyan-600' }
              ].map((company) => (
                <div key={company.name} className="transition-all hover:scale-105">
                  <div className={`flex items-center justify-center w-24 h-24 rounded-xl ${company.color} shadow-md hover:shadow-xl transition-all`}>
                    <div className="text-3xl font-bold text-white">{company.initials}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden border-t border-gray-900/5 bg-gradient-to-br from-slate-100 via-gray-50 to-blue-50/30 py-20">
        {/* Subtle background element */}
        <div className="absolute inset-0 overflow-hidden opacity-40">
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-br from-[#0EA5E9]/10 to-transparent blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7]">
                  <span className="font-sans text-lg font-bold text-white">O</span>
                </div>
                <span className="font-sans text-xl font-bold text-gray-900">Onekof</span>
              </div>
              <p className="font-sans mb-6 max-w-md text-sm leading-relaxed text-gray-600">
                Onekof is the first project management platform built specifically for Ethiopian teams.
                We combine the power of modern collaboration tools with native support for the Ethiopian
                calendar, 4 local languages (Amharic, Afaan Oromoo, Tigrinya, English), and AI-powered
                workflows to help teams ship faster and collaborate better.
              </p>
              <p className="font-sans text-sm text-gray-600">
                Built in Ethiopia, for Ethiopia. 🇪🇹
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="font-sans mb-4 text-sm font-bold text-gray-900">{col.title}</h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="font-sans text-sm text-gray-600 transition-colors hover:text-gray-900">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Additional Footer Section */}
          <div className="mt-12 grid gap-8 border-t border-gray-900/5 pt-8 md:grid-cols-3">
            <div>
              <h4 className="font-sans mb-3 text-sm font-bold text-gray-900">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="font-sans text-sm text-gray-600 hover:text-gray-900 transition-colors">Documentation</a></li>
                <li><a href="#" className="font-sans text-sm text-gray-600 hover:text-gray-900 transition-colors">API Reference</a></li>
                <li><a href="#" className="font-sans text-sm text-gray-600 hover:text-gray-900 transition-colors">Support Center</a></li>
                <li><a href="#" className="font-sans text-sm text-gray-600 hover:text-gray-900 transition-colors">System Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans mb-3 text-sm font-bold text-gray-900">Community</h4>
              <ul className="space-y-2">
                <li><a href="#" className="font-sans text-sm text-gray-600 hover:text-gray-900 transition-colors">GitHub</a></li>
                <li><a href="#" className="font-sans text-sm text-gray-600 hover:text-gray-900 transition-colors">Twitter</a></li>
                <li><a href="#" className="font-sans text-sm text-gray-600 hover:text-gray-900 transition-colors">Discord</a></li>
                <li><a href="#" className="font-sans text-sm text-gray-600 hover:text-gray-900 transition-colors">Telegram</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans mb-3 text-sm font-bold text-gray-900">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="font-sans text-sm text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="font-sans text-sm text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="font-sans text-sm text-gray-600 hover:text-gray-900 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="font-sans text-sm text-gray-600 hover:text-gray-900 transition-colors">License</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-900/5 pt-8 text-center">
            <p className="font-sans text-sm text-gray-500">
              © 2026 Onekof. All rights reserved. Made with ❤️ in Ethiopia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

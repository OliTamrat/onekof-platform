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
  MessageSquare,
  Check,
  Rocket,
  LayoutDashboard,
  Code2,
} from 'lucide-react';

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0F172A]">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-500/20 via-purple-500/20 to-orange-500/20 blur-3xl animate-pulse"
             style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-600/20 via-emerald-500/20 to-orange-600/20 blur-3xl animate-pulse"
             style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-purple-500 to-orange-500 opacity-75 blur-xl transition-all group-hover:opacity-100 group-hover:blur-2xl" />
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-purple-600 to-orange-500 shadow-lg">
                  <span className="text-xl font-black text-white">O</span>
                </div>
              </div>
              <span className="text-2xl font-black text-white">Onekof</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden items-center gap-8 lg:flex">
              <a href="#features" className="text-sm font-semibold text-gray-300 transition-colors hover:text-white">
                Features
              </a>
              <a href="#pricing" className="text-sm font-semibold text-gray-300 transition-colors hover:text-white">
                Pricing
              </a>
              <a href="#customers" className="text-sm font-semibold text-gray-300 transition-colors hover:text-white">
                Customers
              </a>

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-gray-300 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
                >
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{selectedLanguage}</span>
                  <ChevronRight className={`h-4 w-4 transition-transform ${isLanguageOpen ? 'rotate-90' : ''}`} />
                </button>
                {isLanguageOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#1E293B] shadow-2xl backdrop-blur-xl">
                    {['English', 'አማርኛ', 'Afaan Oromoo', 'ትግርኛ'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setSelectedLanguage(lang);
                          setIsLanguageOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-sm transition-colors ${
                          selectedLanguage === lang
                            ? 'bg-gradient-to-r from-emerald-500 to-purple-600 font-semibold text-white'
                            : 'text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/auth/signin"
                className="text-sm font-semibold text-gray-300 transition-colors hover:text-white"
              >
                Sign in
              </Link>

              <Link
                href="/auth/signup"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-purple-600 to-orange-500 p-[2px] transition-all hover:shadow-2xl hover:shadow-emerald-500/50"
              >
                <span className="relative block rounded-[10px] bg-[#0F172A] px-6 py-3 text-sm font-bold text-white transition-all group-hover:bg-transparent">
                  Get Started Free
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - DRAMATICALLY REDESIGNED */}
      <section className="relative z-10 overflow-hidden px-6 pt-20 pb-32 lg:px-8 lg:pt-32 lg:pb-40">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left: Epic Headlines */}
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2.5 backdrop-blur-xl">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-sm font-bold text-emerald-400">
                  🇪🇹 Made in Ethiopia, for Ethiopia
                </span>
              </div>

              {/* Massive Headline */}
              <h1 className="mb-8 text-6xl font-black leading-[1.1] tracking-tight text-white lg:text-7xl xl:text-8xl">
                Build the
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
                  future
                </span>
                {' '}faster
              </h1>

              {/* Subheadline */}
              <p className="mb-10 text-xl leading-relaxed text-gray-400 lg:text-2xl">
                Ethiopian calendar. 4 languages. AI-powered.
                <br />
                <strong className="font-bold text-gray-200">
                  The only project management tool built for how Ethiopians work.
                </strong>
              </p>

              {/* Giant CTAs */}
              <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/auth/signup"
                  className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-purple-600 to-orange-500 px-10 py-6 text-lg font-bold text-white shadow-2xl shadow-emerald-500/50 transition-all hover:scale-105 hover:shadow-emerald-500/70"
                >
                  <Rocket className="h-6 w-6 transition-transform group-hover:-translate-y-1" />
                  Start Building Free
                  <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                </Link>

                <button className="group inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-white/20 bg-white/5 px-10 py-6 text-lg font-bold text-white backdrop-blur-xl transition-all hover:border-white/40 hover:bg-white/10">
                  <Play className="h-6 w-6 fill-current" />
                  Watch Demo
                </button>
              </div>

              {/* Trust Badges */}
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span>Free for 10 users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-500" />
                    <span>No credit card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-500" />
                    <span>2-minute setup</span>
                  </div>
                </div>

                {/* Social Proof */}
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-12 w-12 rounded-full border-2 border-[#0F172A] bg-gradient-to-br from-emerald-400 via-purple-500 to-orange-400"
                      />
                    ))}
                  </div>
                  <div className="text-sm">
                    <div className="font-bold text-white">500+ Ethiopian teams</div>
                    <div className="text-gray-400">building the future</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Floating Dashboard Preview */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-10 rounded-[3rem] bg-gradient-to-r from-emerald-500 via-purple-600 to-orange-500 opacity-30 blur-3xl" />

              {/* Dashboard Card */}
              <div
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#1E293B]/90 shadow-2xl backdrop-blur-2xl"
                style={{
                  transform: `perspective(1000px) rotateY(${scrollY * 0.02}deg) rotateX(${-scrollY * 0.01}deg)`,
                  transition: 'transform 0.1s ease-out',
                }}
              >
                {/* Header */}
                <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-orange-500/10 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <div className="ml-3 flex-1 rounded-lg bg-white/5 px-4 py-2 text-xs text-gray-400">
                      app.onekof.com
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">Mobile App Launch 🚀</h3>
                      <p className="text-sm text-gray-400">12 tasks • የካቲት 20, 2017</p>
                    </div>
                    <button className="rounded-lg bg-gradient-to-r from-emerald-500 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/50">
                      + Add Task
                    </button>
                  </div>

                  {/* Kanban Preview */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { title: 'To Do', count: 3, color: 'gray' },
                      { title: 'In Progress', count: 2, color: 'emerald' },
                      { title: 'Done', count: 5, color: 'purple' },
                    ].map((col) => (
                      <div key={col.title} className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-300">{col.title}</span>
                          <span className={`rounded-full bg-${col.color}-500/20 px-2 py-0.5 text-xs font-bold text-${col.color}-400`}>
                            {col.count}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="rounded-lg border border-white/10 bg-white/5 p-2 backdrop-blur-sm">
                            <div className="mb-1 text-xs font-semibold text-white">የተጠቃሚ ንድፍ</div>
                            <div className="flex items-center gap-1">
                              <div className="h-4 w-4 rounded-full bg-gradient-to-br from-emerald-400 to-purple-500" />
                              <div className="h-4 w-4 rounded-full bg-gradient-to-br from-purple-400 to-orange-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Activity */}
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                    <div className="mb-2 text-xs font-bold text-gray-400">ACTIVITY</div>
                    <div className="space-y-2 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span><strong className="text-white">Sarah</strong> completed a task</span>
                        <span className="ml-auto text-gray-500">2m</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badges */}
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  { icon: '🇪🇹', text: 'Ethiopian Calendar', color: 'emerald' },
                  { icon: '✨', text: 'AI-Powered', color: 'purple' },
                  { icon: '🌍', text: '4 Languages', color: 'orange' },
                ].map((badge) => (
                  <div
                    key={badge.text}
                    className={`rounded-xl border border-${badge.color}-500/20 bg-${badge.color}-500/10 px-4 py-2 text-sm font-bold text-${badge.color}-400 backdrop-blur-xl`}
                  >
                    {badge.icon} {badge.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 border-y border-white/10 bg-white/5 py-12 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { value: '500+', label: 'Ethiopian Teams', icon: Users, color: 'emerald' },
              { value: '50K+', label: 'Tasks Shipped', icon: CheckCircle2, color: 'purple' },
              { value: '42%', label: 'Faster Delivery', icon: TrendingUp, color: 'orange' },
              { value: '99.9%', label: 'Uptime', icon: Shield, color: 'emerald' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className={`mx-auto mb-3 h-10 w-10 text-${stat.color}-400`} />
                <div className="mb-2 text-5xl font-black text-white">{stat.value}</div>
                <div className="text-sm font-semibold text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Bento Grid Style */}
      <section id="features" className="relative z-10 px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-5xl font-black text-white lg:text-6xl">
              Built for{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
                Ethiopia
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-400">
              Features you won't find in Jira, Asana, or Monday
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: 'Ethiopian Calendar',
                description: 'Plan in የካቲት, not February. Native የኢትዮጵያ ቀን መቁጠሪያ support.',
                color: 'emerald',
                span: 'lg:col-span-2',
              },
              {
                icon: Globe,
                title: '4 Languages',
                description: 'Amharic, Afaan Oromoo, Tigrinya, English',
                color: 'purple',
              },
              {
                icon: Sparkles,
                title: 'AI-Powered',
                description: 'Claude AI turns ideas into tasks instantly',
                color: 'orange',
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Built for Ethiopian internet. Offline mode.',
                color: 'emerald',
                span: 'lg:col-span-2',
              },
              {
                icon: Shield,
                title: 'Data Sovereignty',
                description: 'Hosted in Ethiopia. Your data stays here.',
                color: 'purple',
              },
              {
                icon: MessageSquare,
                title: 'Real-Time Collab',
                description: 'Comments, mentions, file sharing',
                color: 'orange',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all hover:border-${feature.color}-500/50 hover:bg-white/10 ${feature.span || ''}`}
              >
                <div className={`absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-${feature.color}-500/20 to-transparent blur-3xl transition-all group-hover:scale-150`} />
                <div className="relative">
                  <div className={`mb-4 inline-flex rounded-2xl bg-${feature.color}-500/10 p-4`}>
                    <feature.icon className={`h-8 w-8 text-${feature.color}-400`} />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-5xl font-black text-white">
              Loved by{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
                Ethiopian teams
              </span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote: "The Ethiopian calendar feature alone saves us 10+ hours per month. No more manual date conversions!",
                author: "Abebe Kebede",
                role: "Engineering Manager",
                company: "Addis Tech",
              },
              {
                quote: "Our team works seamlessly in Amharic and Oromoo. Finally, software that understands us.",
                author: "Hanna Tessema",
                role: "Product Lead",
                company: "Ethiopian Startup",
              },
              {
                quote: "Switched from Jira. Onekof is faster, cheaper, and built for how we actually work.",
                author: "Samuel Tadesse",
                role: "CTO",
                company: "Fintech Ethiopia",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition-all hover:border-emerald-500/50"
              >
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-purple-500/20 blur-2xl transition-all group-hover:scale-150" />
                <div className="relative">
                  <div className="mb-4 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-orange-500 text-orange-500" />
                    ))}
                  </div>
                  <p className="mb-6 text-lg leading-relaxed text-gray-300">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-purple-600" />
                    <div>
                      <div className="font-bold text-white">{testimonial.author}</div>
                      <div className="text-sm text-gray-400">{testimonial.role}, {testimonial.company}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-5xl font-black text-white lg:text-6xl">
              Simple{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
                pricing
              </span>
            </h2>
            <p className="text-xl text-gray-400">Start free. Scale when you're ready.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Free */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white">Free</h3>
                <p className="mt-2 text-gray-400">For small teams</p>
              </div>
              <div className="mb-6">
                <span className="text-6xl font-black text-white">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="mb-8 space-y-3">
                {['10 users', 'Unlimited projects', 'Ethiopian calendar', '4 languages', 'Basic AI'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-gray-300">
                    <Check className="h-5 w-5 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="block w-full rounded-xl border-2 border-white/20 bg-white/5 py-4 text-center font-bold text-white transition-all hover:bg-white/10"
              >
                Get Started
              </Link>
            </div>

            {/* Pro - HIGHLIGHTED */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-500/10 via-purple-500/10 to-orange-500/10 p-8 backdrop-blur-xl shadow-2xl shadow-emerald-500/50">
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="rounded-full bg-gradient-to-r from-emerald-500 to-purple-600 px-4 py-1 text-sm font-bold text-white">
                  ⭐ Most Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white">Pro</h3>
                <p className="mt-2 text-gray-300">For growing teams</p>
              </div>
              <div className="mb-6">
                <span className="text-6xl font-black text-white">$8</span>
                <span className="text-gray-300">/user/month</span>
              </div>
              <ul className="mb-8 space-y-3">
                {['Unlimited users', 'Everything in Free', 'Advanced AI', 'Priority support', 'Custom workflows', 'Analytics', 'API access', 'SSO'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-gray-200">
                    <Check className="h-5 w-5 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup"
                className="block w-full rounded-xl bg-gradient-to-r from-emerald-500 to-purple-600 py-4 text-center font-bold text-white shadow-lg shadow-emerald-500/50 transition-all hover:scale-105"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white">Enterprise</h3>
                <p className="mt-2 text-gray-400">For large orgs</p>
              </div>
              <div className="mb-6">
                <span className="text-6xl font-black text-white">Custom</span>
              </div>
              <ul className="mb-8 space-y-3">
                {['Everything in Pro', 'Dedicated support', 'Custom integrations', 'On-premise', 'SLA guarantee', 'Advanced security', 'Training'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-gray-300">
                    <Check className="h-5 w-5 text-purple-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="#contact"
                className="block w-full rounded-xl border-2 border-purple-500 bg-purple-500/10 py-4 text-center font-bold text-purple-400 transition-all hover:bg-purple-500 hover:text-white"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 overflow-hidden px-6 py-32 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-purple-500/20 to-orange-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-6xl font-black text-white lg:text-7xl">
            Ready to build{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-orange-400 bg-clip-text text-transparent">
              faster
            </span>
            ?
          </h2>
          <p className="mb-12 text-2xl text-gray-300">
            Join 500+ Ethiopian teams shipping better products
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/signup"
              className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-purple-600 to-orange-500 px-12 py-6 text-xl font-bold text-white shadow-2xl shadow-emerald-500/50 transition-all hover:scale-105"
            >
              <Rocket className="h-7 w-7" />
              Start Building Free
              <ArrowRight className="h-7 w-7 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-gray-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Free for 10 users
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-purple-500" />
              No credit card
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-orange-500" />
              2-minute setup
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-white/5 px-6 py-20 backdrop-blur-2xl lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-purple-600 to-orange-500">
                  <span className="text-xl font-black text-white">O</span>
                </div>
                <span className="text-2xl font-black text-white">Onekof</span>
              </div>
              <p className="mb-6 max-w-md text-gray-400">
                The first project management platform built for Ethiopian teams. Ethiopian calendar, 4 languages, AI-powered.
              </p>
              <p className="text-sm font-bold text-emerald-400">🇪🇹 Proudly made in Addis Ababa</p>
            </div>
            {[
              { title: 'Product', links: [{ name: 'Features', href: '#features' }, { name: 'Pricing', href: '#pricing' }, { name: 'Security', href: '#' }] },
              { title: 'Company', links: [{ name: 'About', href: '#' }, { name: 'Blog', href: '#' }, { name: 'Careers', href: '#' }] },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-sm font-bold text-white">{col.title}</h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.name}>
                      <a href={link.href} className="text-sm text-gray-400 transition-colors hover:text-white">
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-gray-500">
            © 2026 Onekof. All rights reserved. Made with ❤️ in Ethiopia.
          </div>
        </div>
      </footer>
    </div>
  );
}

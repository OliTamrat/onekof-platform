'use client';

import { useState, useEffect , type ReactNode } from 'react';
import {
  ArrowRight, Check, Star, Zap, Shield, BarChart3, Users, FolderKanban,
  ChevronDown, Bell, Search, Plus, MoreHorizontal, Clock, CheckCircle2,
  Circle, TrendingUp, Calendar, MessageSquare, Layers,
  Home, Settings, ListTodo, Target, PieChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================
// MIDNIGHT REFINED — Clean, Professional Dark Theme
// Single electric blue accent. No rainbow gradients. System fonts.
// ============================================================

export default function MidnightAuroraPreview() {
  const [activeView, setActiveView] = useState<'marketing' | 'dashboard'>('marketing');

  return (
    <div className="min-h-screen bg-[#0F1117]" style={{ fontFamily: '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
      {/* View Toggle */}
      <div className="fixed top-4 right-4 z-50 flex gap-1 rounded-lg bg-[#1A1D27] border border-[#2A2D3A] p-1 shadow-2xl">
        <Button
          onClick={() => setActiveView('marketing')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            activeView === 'marketing'
              ? 'bg-[#2563EB] text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Marketing
        </Button>
        <Button
          onClick={() => setActiveView('dashboard')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            activeView === 'dashboard'
              ? 'bg-[#2563EB] text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Dashboard
        </Button>
      </div>

      {activeView === 'marketing' ? <MarketingPage /> : <DashboardPage />}
    </div>
  );
}

// ─── MARKETING PAGE ──────────────────────────────────────────

function MarketingPage() {
  const heroWords = ['ship faster', 'track budgets', 'plan sprints', 'collaborate'];
  const [heroWordIndex, setHeroWordIndex] = useState(0);
  const [heroTyped, setHeroTyped] = useState('');

  useEffect(() => {
    const word = heroWords[heroWordIndex];
    let i = 0;
    setHeroTyped('');
    const typeTimer = setInterval(() => {
      if (i <= word.length) {
        setHeroTyped(word.slice(0, i));
        i++;
      } else {
        clearInterval(typeTimer);
        setTimeout(() => {
          setHeroWordIndex((prev) => (prev + 1) % heroWords.length);
        }, 2200);
      }
    }, 80);
    return () => clearInterval(typeTimer);
  }, [heroWordIndex]);

  return (
    <div className="min-h-screen bg-[#0F1117] text-white overflow-hidden" style={{ fontFamily: '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
      {/* Subtle ambient glow — just one, barely visible */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] left-[40%] w-[800px] h-[400px] bg-[#2563EB]/[0.04] rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <img src="/logo-wordmark.png" alt="Onekof" className="h-7" />
            </div>
            <div className="hidden md:flex items-center gap-6">
              {['Product', 'Solutions', 'Pricing', 'Enterprise'].map((item) => (
                <Button key={item} className="text-[13px] text-slate-300 hover:text-white transition-colors">
                  {item}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button className="text-[13px] text-slate-300 hover:text-white transition-colors px-3 py-1.5">
              Sign in
            </Button>
            <Button className="text-[13px] font-medium bg-[#2563EB] text-white px-4 py-2 rounded-lg hover:bg-[#1d4ed8] transition-colors">
              Start Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-32">
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20 px-4 py-1.5 mb-8">
            <div className="h-1.5 w-1.5 rounded-full bg-[#2563EB] animate-pulse" />
            <span className="text-xs font-medium text-[#60A5FA]">
              Built for Ethiopian organizations
            </span>
          </div>

          <h1 className="text-5xl md:text-[72px] font-semibold tracking-[-0.04em] leading-[1.05] mb-6">
            <span className="text-white">One platform to</span>
            <br />
            <span className="relative inline-block">
              <span className="text-[#2563EB]">
                {heroTyped}
              </span>
              <span className="ml-0.5 inline-block h-[0.9em] w-[3px] animate-pulse rounded-full bg-[#2563EB] align-middle" />
            </span>
          </h1>

          <p className="text-[17px] text-slate-200 max-w-xl mx-auto mb-10 leading-relaxed tracking-[-0.01em]">
            The intelligent project management platform designed for Ethiopian organizations.
            Plan in your calendar, budget in Birr, deliver on time.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="group inline-flex items-center justify-center gap-2 bg-[#2563EB] text-white font-medium px-7 py-3 rounded-lg hover:bg-[#1d4ed8] transition-colors text-[14px]">
              Start Free Trial
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            <Button variant="outline" className="inline-flex items-center justify-center gap-2 border border-[#2A2D3A] text-slate-300 font-medium px-7 py-3 rounded-lg hover:bg-white/[0.04] hover:border-[#3A3D4A] transition-all text-[14px]">
              Book a Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-16 flex flex-col items-center gap-4">
            <div className="flex -space-x-2">
              {['#3B82F6', '#60A5FA', '#93C5FD', '#2563EB', '#1D4ED8'].map((color, i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-[#0F1117] flex items-center justify-center" style={{ backgroundColor: color }}>
                  <span className="text-[10px] font-medium text-white mix-blend-overlay">{String.fromCharCode(65 + i)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-[#2563EB] text-[#2563EB]" />
              ))}
              <span className="text-[13px] text-slate-400 ml-2">4.9/5 from 500+ reviews</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative max-w-5xl mx-auto px-6 mt-20">
          <div className="relative rounded-xl border border-[#2A2D3A] bg-[#161922] shadow-2xl shadow-black/40 overflow-hidden">
            {/* Window Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1E2130]">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#3A3D4A]" />
                <div className="h-3 w-3 rounded-full bg-[#3A3D4A]" />
                <div className="h-3 w-3 rounded-full bg-[#3A3D4A]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-[#1A1D27] text-xs text-slate-400 border border-[#2A2D3A]">app.onekof.com/dashboard</div>
              </div>
            </div>
            {/* Content */}
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { label: 'Active Projects', value: '24', change: '+3 this week', icon: FolderKanban },
                { label: 'Tasks Completed', value: '1,248', change: '94% on time', icon: CheckCircle2 },
                { label: 'Team Velocity', value: '87%', change: '+12% vs last sprint', icon: TrendingUp },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg bg-[#1A1D27] border border-[#2A2D3A] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
                    <div className="h-7 w-7 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center">
                      <stat.icon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div className="text-2xl font-semibold text-white tracking-[-0.02em]">{stat.value}</div>
                  <div className="text-xs text-[#60A5FA] mt-1">{stat.change}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.03em] text-white mb-4">
              Built different.{' '}
              <span className="text-[#2563EB]">Built for you.</span>
            </h2>
            <p className="text-slate-200 text-[17px] max-w-2xl mx-auto tracking-[-0.01em]">
              Every feature designed for how Ethiopian organizations actually work.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Calendar,
                title: 'Ethiopian Calendar',
                description: 'Native support for the Ethiopian calendar system. Plan sprints, set deadlines, and track milestones in the calendar your team uses.',
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Role-based access control, audit logs, SSO integration, and data sovereignty options for government organizations.',
              },
              {
                icon: BarChart3,
                title: 'ETB Budgeting',
                description: 'Track project budgets in Ethiopian Birr with real-time expense monitoring, forecasting, and approval workflows.',
              },
              {
                icon: Zap,
                title: 'AI-Powered Insights',
                description: 'Intelligent risk detection, workload balancing suggestions, and automated progress reports powered by AI.',
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Real-time task updates, threaded comments, file sharing, and @mentions. Keep everyone aligned without the noise.',
              },
              {
                icon: Layers,
                title: 'White-Label Ready',
                description: 'Custom domains, branded login pages, and organizational theming. Make Onekof look like your own platform.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl bg-[#161922] border border-[#2A2D3A] p-6 hover:border-[#3A3D4A] hover:bg-[#1A1D27] transition-all duration-200"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB] mb-4">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2 tracking-[-0.01em]">{feature.title}</h3>
                <p className="text-[13px] text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-24 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.03em] text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-200 text-[17px] tracking-[-0.01em]">Start free. Scale as you grow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: 'Free',
                period: 'forever',
                description: 'For individuals and small teams getting started.',
                features: ['Up to 5 team members', '3 active projects', 'Basic task management', 'Ethiopian calendar'],
                cta: 'Get Started',
                highlight: false,
              },
              {
                name: 'Professional',
                price: '2,499 ETB',
                period: '/month',
                description: 'For growing teams that need more power.',
                features: ['Unlimited members', 'Unlimited projects', 'AI-powered insights', 'ETB budgeting', 'Priority support'],
                cta: 'Start Free Trial',
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                description: 'For organizations requiring full control.',
                features: ['Everything in Pro', 'Custom domain', 'White-label branding', 'Dedicated support', 'Data sovereignty', 'SSO/SAML'],
                cta: 'Contact Sales',
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-6 relative ${
                  plan.highlight
                    ? 'bg-[#161922] border-2 border-[#2563EB]/40 shadow-lg shadow-[#2563EB]/5'
                    : 'bg-[#161922] border border-[#2A2D3A]'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#2563EB] text-white text-xs font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white mb-1 tracking-[-0.01em]">{plan.name}</h3>
                <p className="text-[13px] text-slate-400 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-white tracking-[-0.02em]">{plan.price}</span>
                  {plan.period && <span className="text-slate-400 text-[13px]">{plan.period}</span>}
                </div>
                <Button
                  className={`w-full py-2.5 rounded-lg text-[13px] font-medium transition-all mb-6 ${
                    plan.highlight
                      ? 'bg-[#2563EB] text-white hover:bg-[#1d4ed8]'
                      : 'bg-[#1A1D27] border border-[#2A2D3A] text-slate-300 hover:bg-[#1E2130] hover:border-[#3A3D4A]'
                  }`}
                >
                  {plan.cta}
                </Button>
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-[#2563EB] shrink-0" />
                      <span className="text-[13px] text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="relative rounded-2xl bg-[#161922] border border-[#2A2D3A] p-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.03em] text-white mb-4">
              Ready to transform how your team works?
            </h2>
            <p className="text-slate-200 text-[17px] mb-8 tracking-[-0.01em]">
              Join 200+ Ethiopian organizations already using Onekof.
            </p>
            <Button className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-medium px-7 py-3 rounded-lg hover:bg-[#1d4ed8] transition-colors text-[14px]">
              Start Your Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.06] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
                <span className="text-white font-semibold text-xs">O</span>
              </div>
              <img src="/logo-wordmark.png" alt="Onekof" className="h-6" />
            </div>
            <p className="text-xs text-slate-500">&copy; 2024 Onekof. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── DASHBOARD PAGE ──────────────────────────────────────────

function DashboardPage() {
  const navItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: FolderKanban, label: 'Projects', active: false },
    { icon: ListTodo, label: 'My Tasks', active: false },
    { icon: Target, label: 'Goals', active: false },
    { icon: PieChart, label: 'Reports', active: false },
    { icon: Users, label: 'Team', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  const tasks = [
    { title: 'Review Q4 budget proposal', project: 'Finance', priority: 'high', status: 'in-progress', assignee: 'AT', due: '2 days' },
    { title: 'Update API documentation', project: 'Engineering', priority: 'medium', status: 'todo', assignee: 'MK', due: '5 days' },
    { title: 'Prepare stakeholder presentation', project: 'Marketing', priority: 'high', status: 'in-progress', assignee: 'SB', due: 'Tomorrow' },
    { title: 'Database migration testing', project: 'Engineering', priority: 'low', status: 'done', assignee: 'DL', due: 'Done' },
    { title: 'User research interviews', project: 'Product', priority: 'medium', status: 'todo', assignee: 'NK', due: '1 week' },
  ];

  const priorityColors: Record<string, string> = {
    high: 'text-rose-400 bg-rose-500/10',
    medium: 'text-amber-400 bg-amber-500/10',
    low: 'text-slate-400 bg-slate-500/10',
  };

  const statusIcons: Record<string, ReactNode> = {
    'todo': <Circle className="h-4 w-4 text-slate-500" />,
    'in-progress': <Clock className="h-4 w-4 text-amber-400" />,
    'done': <CheckCircle2 className="h-4 w-4 text-[#2563EB]" />,
  };

  return (
    <div className="min-h-screen bg-[#0F1117] flex" style={{ fontFamily: '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
      {/* Sidebar */}
      <aside className="w-[240px] border-r border-[#1E2130] bg-[#13151E] flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-[#1E2130]">
          <img src="/logo-wordmark.png" alt="Onekof" className="h-7" />
        </div>

        {/* Org Switcher */}
        <div className="px-3 py-3 border-b border-[#1E2130]">
          <Button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
            <div className="h-6 w-6 rounded bg-[#2563EB] flex items-center justify-center">
              <span className="text-[10px] font-semibold text-white">M</span>
            </div>
            <span className="text-[13px] text-slate-300 flex-1 text-left truncate">Ministry of Tech</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {navItems.map((item) => (
            <Button
              key={item.label}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all ${
                item.active
                  ? 'bg-[#2563EB]/10 text-white font-medium'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${item.active ? 'text-[#2563EB]' : ''}`} />
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-3 border-t border-[#1E2130]">
          <div className="flex items-center gap-2.5 px-2">
            <div className="h-7 w-7 rounded-full bg-[#2563EB] flex items-center justify-center">
              <span className="text-xs font-semibold text-white">O</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-white truncate">Oli Tamrat</p>
              <p className="text-[10px] text-slate-500 truncate">oli@onekof.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-14 border-b border-[#1E2130] bg-[#13151E] flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-[14px] font-semibold text-white tracking-[-0.01em]">Dashboard</h1>
            <span className="text-xs text-slate-700">/</span>
            <span className="text-xs text-slate-500">Overview</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Button className="h-8 w-8 rounded-lg bg-[#1A1D27] border border-[#2A2D3A] flex items-center justify-center hover:bg-[#1E2130] transition-colors">
              <Search className="h-3.5 w-3.5 text-slate-500" />
            </Button>
            <Button className="h-8 w-8 rounded-lg bg-[#1A1D27] border border-[#2A2D3A] flex items-center justify-center hover:bg-[#1E2130] transition-colors relative">
              <Bell className="h-3.5 w-3.5 text-slate-500" />
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#2563EB] text-[9px] font-semibold text-white flex items-center justify-center">3</div>
            </Button>
            <Button className="h-8 flex items-center gap-1.5 px-3 rounded-lg bg-[#2563EB] text-white text-[12px] font-medium hover:bg-[#1d4ed8] transition-colors">
              <Plus className="h-3.5 w-3.5" />
              New Task
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Active Projects', value: '12', change: '+2', icon: FolderKanban },
              { label: 'Open Tasks', value: '47', change: '-5', icon: ListTodo },
              { label: 'Team Members', value: '24', change: '+1', icon: Users },
              { label: 'Completion Rate', value: '87%', change: '+4%', icon: TrendingUp },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-[#161922] border border-[#2A2D3A] p-4 hover:border-[#3A3D4A] transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[12px] text-slate-400 font-medium">{stat.label}</span>
                  <div className="h-8 w-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center">
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-white tracking-[-0.02em]">{stat.value}</span>
                  <span className="text-[12px] font-medium text-[#2563EB]">{stat.change}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5">
            {/* Task List */}
            <div className="col-span-2 rounded-xl bg-[#161922] border border-[#2A2D3A]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E2130]">
                <h2 className="text-[13px] font-semibold text-white">Recent Tasks</h2>
                <Button className="text-[12px] text-[#2563EB] hover:text-[#60A5FA] transition-colors font-medium">
                  View All
                </Button>
              </div>
              <div className="divide-y divide-[#1E2130]">
                {tasks.map((task) => (
                  <div key={task.title} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    {statusIcons[task.status]}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{task.project}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    <div className="h-6 w-6 rounded-full bg-[#1A1D27] border border-[#2A2D3A] flex items-center justify-center">
                      <span className="text-[10px] font-medium text-slate-400">{task.assignee}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 w-16 text-right">{task.due}</span>
                    <Button className="text-slate-500 hover:text-slate-300">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Activity */}
              <div className="rounded-xl bg-[#161922] border border-[#2A2D3A]">
                <div className="px-5 py-4 border-b border-[#1E2130]">
                  <h2 className="text-[13px] font-semibold text-white">Activity</h2>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { user: 'AT', action: 'completed', target: 'Database migration', time: '2m ago' },
                    { user: 'SB', action: 'commented on', target: 'Budget review', time: '15m ago' },
                    { user: 'MK', action: 'created', target: 'API docs task', time: '1h ago' },
                    { user: 'NK', action: 'moved', target: 'User research to In Progress', time: '2h ago' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-medium text-white">{activity.user}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-slate-300">
                          <span className="text-white font-medium">{activity.user}</span>
                          {' '}{activity.action}{' '}
                          <span className="text-[#2563EB]">{activity.target}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-xl bg-[#161922] border border-[#2A2D3A] p-5">
                <h2 className="text-[13px] font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Plus, label: 'New Task' },
                    { icon: FolderKanban, label: 'New Project' },
                    { icon: Users, label: 'Invite Member' },
                    { icon: MessageSquare, label: 'Send Update' },
                  ].map((action) => (
                    <Button
                      key={action.label}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg bg-[#1A1D27] border border-[#2A2D3A] hover:border-[#3A3D4A] hover:bg-[#1E2130] transition-all"
                    >
                      <action.icon className="h-4 w-4 text-slate-400" />
                      <span className="text-[10px] text-slate-400 font-medium">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

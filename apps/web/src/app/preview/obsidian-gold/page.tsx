'use client';

import { useState , type ReactNode } from 'react';
import {
  ArrowRight, Check, Star, Zap, Shield, BarChart3, Users, FolderKanban,
  ChevronDown, Bell, Search, Plus, MoreHorizontal, Clock, CheckCircle2,
  Circle, AlertCircle, TrendingUp, Calendar, MessageSquare, Layers,
  Home, Settings, ListTodo, Target, PieChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================
// OPTION 2: OBSIDIAN & GOLD — Luxury Precision
// ============================================================

export default function ObsidianGoldPreview() {
  const [activeView, setActiveView] = useState<'marketing' | 'dashboard'>('marketing');

  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* View Toggle */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 rounded-full bg-[#18181B] border border-[#27272A] p-1 shadow-2xl">
        <Button
          onClick={() => setActiveView('marketing')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeView === 'marketing'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Marketing
        </Button>
        <Button
          onClick={() => setActiveView('dashboard')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeView === 'dashboard'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black'
              : 'text-zinc-400 hover:text-white'
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
  return (
    <div className="min-h-screen bg-[#09090B] text-white overflow-hidden">
      {/* Navbar */}
      <nav className="relative z-10 border-b border-[#27272A]/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-black font-bold text-sm">O</span>
              </div>
              <img src="/logo-wordmark.png?v=2" alt="Onekof" className="h-12" />
            </div>
            <div className="hidden md:flex items-center gap-6">
              {['Product', 'Solutions', 'Pricing', 'Enterprise'].map((item) => (
                <Button key={item} className="text-sm text-zinc-400 hover:text-white transition-colors">
                  {item}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5">
              Sign in
            </Button>
            <Button className="text-sm font-medium bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-4 py-2 rounded-lg hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg shadow-amber-500/20">
              Start Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-amber-600/8 rounded-full blur-[80px]" />

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 mb-8">
            <Star className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-300">Trusted by 200+ organizations across Ethiopia</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            <span className="text-white">Project management</span>
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              built for precision
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The project management platform that scales with your ambition.
            Ethiopian calendar, ETB budgeting, and enterprise-grade control — all in one.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold px-8 py-3.5 rounded-lg hover:from-amber-400 hover:to-yellow-400 transition-all shadow-xl shadow-amber-500/25 text-sm">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button className="inline-flex items-center justify-center gap-2 border border-[#27272A] text-zinc-300 font-medium px-8 py-3.5 rounded-lg hover:bg-[#18181B] hover:border-[#3F3F46] transition-all text-sm">
              Book a Demo
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-16 flex flex-col items-center gap-4">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border-2 border-[#09090B] flex items-center justify-center">
                  <span className="text-[10px] font-medium text-zinc-300">{String.fromCharCode(65 + i)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-sm text-zinc-500 ml-2">4.9/5 from 500+ reviews</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative max-w-5xl mx-auto px-6 mt-20">
          <div className="rounded-xl border border-[#27272A] bg-[#0F0F12] shadow-2xl shadow-amber-500/5 overflow-hidden">
            {/* Window Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272A]">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#27272A]" />
                <div className="h-3 w-3 rounded-full bg-[#27272A]" />
                <div className="h-3 w-3 rounded-full bg-[#27272A]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-[#18181B] text-xs text-zinc-500">app.onekof.com/dashboard</div>
              </div>
            </div>
            {/* Content */}
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { label: 'Active Projects', value: '24', change: '+3 this week', icon: FolderKanban },
                { label: 'Tasks Completed', value: '1,248', change: '94% on time', icon: CheckCircle2 },
                { label: 'Team Velocity', value: '87%', change: '+12% vs last sprint', icon: TrendingUp },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg bg-[#18181B] border border-[#27272A] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-zinc-500 font-medium">{stat.label}</span>
                    <stat.icon className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-amber-400 mt-1">{stat.change}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-[#27272A]/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need,{' '}
              <span className="text-amber-400">nothing you don&apos;t</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Purpose-built for Ethiopian organizations with global-grade capabilities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: 'Ethiopian Calendar',
                description: 'Native support for the Ethiopian calendar system. Plan sprints, set deadlines, and track milestones in the calendar your team actually uses.',
                accent: 'from-amber-500/20 to-amber-600/5',
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Role-based access control, audit logs, SSO integration, and data sovereignty options for government organizations.',
                accent: 'from-amber-500/20 to-amber-600/5',
              },
              {
                icon: BarChart3,
                title: 'ETB Budgeting',
                description: 'Track project budgets in Ethiopian Birr with real-time expense monitoring, forecasting, and approval workflows.',
                accent: 'from-amber-500/20 to-amber-600/5',
              },
              {
                icon: Zap,
                title: 'AI-Powered Insights',
                description: 'Intelligent risk detection, workload balancing suggestions, and automated progress reports powered by AI.',
                accent: 'from-amber-500/20 to-amber-600/5',
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Real-time task updates, threaded comments, file sharing, and @mentions. Keep everyone aligned without the noise.',
                accent: 'from-amber-500/20 to-amber-600/5',
              },
              {
                icon: Layers,
                title: 'White-Label Ready',
                description: 'Custom domains, branded login pages, and organizational theming. Make Onekof look like your own platform.',
                accent: 'from-amber-500/20 to-amber-600/5',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl bg-[#0F0F12] border border-[#27272A] p-6 hover:border-amber-500/30 transition-all duration-300"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.accent} mb-4`}>
                  <feature.icon className="h-5 w-5 text-amber-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 border-t border-[#27272A]/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-zinc-400 text-lg">Start free. Scale as you grow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
                className={`rounded-xl p-6 ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-amber-500/10 to-[#0F0F12] border-2 border-amber-500/40 shadow-xl shadow-amber-500/10 relative'
                    : 'bg-[#0F0F12] border border-[#27272A]'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-zinc-500 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-zinc-500 text-sm">{plan.period}</span>}
                </div>
                <Button
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all mb-6 ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-400 hover:to-yellow-400 shadow-lg shadow-amber-500/20'
                      : 'bg-[#18181B] border border-[#27272A] text-zinc-300 hover:bg-[#27272A]'
                  }`}
                >
                  {plan.cta}
                </Button>
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="text-sm text-zinc-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-[#27272A]/50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="rounded-2xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to transform how your team works?
            </h2>
            <p className="text-zinc-400 text-lg mb-8">
              Join 200+ Ethiopian organizations already using Onekof.
            </p>
            <Button className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold px-8 py-3.5 rounded-lg hover:from-amber-400 hover:to-yellow-400 transition-all shadow-xl shadow-amber-500/25 text-sm">
              Start Your Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#27272A]/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-black font-bold text-xs">O</span>
              </div>
              <img src="/logo-wordmark.png?v=2" alt="Onekof" className="h-10" />
            </div>
            <p className="text-xs text-zinc-600">&copy; 2024 Onekof. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── DASHBOARD PAGE ──────────────────────────────────────────

function DashboardPage() {
  const [sidebarCollapsed] = useState(false);

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
    high: 'text-red-400 bg-red-400/10',
    medium: 'text-amber-400 bg-amber-400/10',
    low: 'text-emerald-400 bg-emerald-400/10',
  };

  const statusIcons: Record<string, ReactNode> = {
    'todo': <Circle className="h-4 w-4 text-zinc-500" />,
    'in-progress': <Clock className="h-4 w-4 text-amber-400" />,
    'done': <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-60'} border-r border-[#27272A] bg-[#0F0F12] flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-[#27272A]">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0">
            <span className="text-black font-bold text-sm">O</span>
          </div>
          {!sidebarCollapsed && <img src="/logo-wordmark.png?v=2" alt="Onekof" className="h-10" />}
        </div>

        {/* Org Switcher */}
        {!sidebarCollapsed && (
          <div className="px-3 py-3 border-b border-[#27272A]">
            <Button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#18181B] transition-colors">
              <div className="h-6 w-6 rounded bg-amber-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-amber-400">M</span>
              </div>
              <span className="text-sm text-zinc-300 flex-1 text-left truncate">Ministry of Tech</span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />
            </Button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {navItems.map((item) => (
            <Button
              key={item.label}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all ${
                item.active
                  ? 'bg-amber-500/10 text-amber-400 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181B]'
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${item.active ? 'text-amber-400' : ''}`} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>

        {/* User */}
        {!sidebarCollapsed && (
          <div className="px-3 py-3 border-t border-[#27272A]">
            <div className="flex items-center gap-2 px-2">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-xs font-bold text-black">O</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">Oli Tamrat</p>
                <p className="text-[10px] text-zinc-500 truncate">oli@onekof.com</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-14 border-b border-[#27272A] bg-[#0F0F12] flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-white">Dashboard</h1>
            <span className="text-xs text-zinc-600">/</span>
            <span className="text-xs text-zinc-500">Overview</span>
          </div>
          <div className="flex items-center gap-3">
            <Button className="h-8 w-8 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center hover:bg-[#27272A] transition-colors">
              <Search className="h-4 w-4 text-zinc-500" />
            </Button>
            <Button className="h-8 w-8 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center hover:bg-[#27272A] transition-colors relative">
              <Bell className="h-4 w-4 text-zinc-500" />
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 text-[9px] font-bold text-black flex items-center justify-center">3</div>
            </Button>
            <Button className="h-8 flex items-center gap-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-medium hover:from-amber-400 hover:to-yellow-400 transition-all">
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
              { label: 'Active Projects', value: '12', change: '+2', icon: FolderKanban, trend: 'up' },
              { label: 'Open Tasks', value: '47', change: '-5', icon: ListTodo, trend: 'down' },
              { label: 'Team Members', value: '24', change: '+1', icon: Users, trend: 'up' },
              { label: 'Completion Rate', value: '87%', change: '+4%', icon: TrendingUp, trend: 'up' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-[#0F0F12] border border-[#27272A] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-500 font-medium">{stat.label}</span>
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <stat.icon className="h-4 w-4 text-amber-400" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Task List */}
            <div className="col-span-2 rounded-xl bg-[#0F0F12] border border-[#27272A]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272A]">
                <h2 className="text-sm font-semibold text-white">Recent Tasks</h2>
                <Button className="text-xs text-amber-400 hover:text-amber-300 transition-colors">View All</Button>
              </div>
              <div className="divide-y divide-[#27272A]">
                {tasks.map((task) => (
                  <div key={task.title} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#18181B]/50 transition-colors">
                    {statusIcons[task.status]}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${task.status === 'done' ? 'text-zinc-500 line-through' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-zinc-600 mt-0.5">{task.project}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    <div className="h-6 w-6 rounded-full bg-[#27272A] flex items-center justify-center">
                      <span className="text-[10px] font-medium text-zinc-400">{task.assignee}</span>
                    </div>
                    <span className="text-xs text-zinc-600 w-16 text-right">{task.due}</span>
                    <Button className="text-zinc-600 hover:text-zinc-400">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Activity */}
              <div className="rounded-xl bg-[#0F0F12] border border-[#27272A]">
                <div className="px-5 py-4 border-b border-[#27272A]">
                  <h2 className="text-sm font-semibold text-white">Activity</h2>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { user: 'AT', action: 'completed', target: 'Database migration', time: '2m ago' },
                    { user: 'SB', action: 'commented on', target: 'Budget review', time: '15m ago' },
                    { user: 'MK', action: 'created', target: 'API docs task', time: '1h ago' },
                    { user: 'NK', action: 'moved', target: 'User research to In Progress', time: '2h ago' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-[#27272A] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-medium text-zinc-400">{activity.user}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-400">
                          <span className="text-zinc-300 font-medium">{activity.user}</span>
                          {' '}{activity.action}{' '}
                          <span className="text-amber-400">{activity.target}</span>
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-xl bg-[#0F0F12] border border-[#27272A] p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Plus, label: 'New Task' },
                    { icon: FolderKanban, label: 'New Project' },
                    { icon: Users, label: 'Invite Member' },
                    { icon: MessageSquare, label: 'Send Update' },
                  ].map((action) => (
                    <Button
                      key={action.label}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg bg-[#18181B] border border-[#27272A] hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
                    >
                      <action.icon className="h-4 w-4 text-amber-400" />
                      <span className="text-[10px] text-zinc-400 font-medium">{action.label}</span>
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

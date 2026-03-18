'use client';

import { useState } from 'react';
import {
  ArrowRight, Check, Star, Zap, Shield, BarChart3, Users, FolderKanban,
  ChevronDown, Bell, Search, Plus, MoreHorizontal, Clock, CheckCircle2,
  Circle, TrendingUp, Calendar, MessageSquare, Layers,
  Home, Settings, ListTodo, Target, PieChart, Sparkles,
} from 'lucide-react';

// ============================================================
// OPTION 5: MIDNIGHT AURORA — Dynamic & Immersive
// ============================================================

export default function MidnightAuroraPreview() {
  const [activeView, setActiveView] = useState<'marketing' | 'dashboard'>('marketing');

  return (
    <div className="min-h-screen bg-[#0A0A1A]">
      {/* View Toggle */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 rounded-full bg-[#12122A] border border-[#1E1E3A] p-1 shadow-2xl">
        <button
          onClick={() => setActiveView('marketing')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeView === 'marketing'
              ? 'bg-gradient-to-r from-teal-400 via-blue-500 to-violet-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Marketing
        </button>
        <button
          onClick={() => setActiveView('dashboard')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeView === 'dashboard'
              ? 'bg-gradient-to-r from-teal-400 via-blue-500 to-violet-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Dashboard
        </button>
      </div>

      {activeView === 'marketing' ? <MarketingPage /> : <DashboardPage />}
    </div>
  );
}

// ─── MARKETING PAGE ──────────────────────────────────────────

function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A1A] text-white overflow-hidden">
      {/* Aurora Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-500/8 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute bottom-[-10%] left-[30%] w-[700px] h-[500px] bg-violet-500/6 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 via-blue-500 to-violet-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-white">Onekof</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {['Product', 'Solutions', 'Pricing', 'Enterprise'].map((item) => (
                <button key={item} className="text-sm text-slate-400 hover:text-white transition-colors">
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5">
              Sign in
            </button>
            <button className="text-sm font-medium bg-gradient-to-r from-teal-400 via-blue-500 to-violet-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all shadow-lg shadow-blue-500/20">
              Start Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32">
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-violet-500/10 border border-white/10 px-4 py-1.5 mb-8 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span className="text-xs font-medium bg-gradient-to-r from-teal-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">
              AI-Powered Project Management for Ethiopia
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            <span className="text-white">Where ambition</span>
            <br />
            <span className="bg-gradient-to-r from-teal-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              meets execution
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The intelligent project management platform designed for Ethiopian organizations.
            Plan in your calendar, budget in Birr, deliver on time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 via-blue-500 to-violet-500 text-white font-semibold px-8 py-3.5 rounded-lg hover:opacity-90 transition-all shadow-xl shadow-blue-500/25 text-sm">
              Start Free Trial
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button className="inline-flex items-center justify-center gap-2 border border-white/10 text-slate-300 font-medium px-8 py-3.5 rounded-lg hover:bg-white/5 hover:border-white/20 transition-all backdrop-blur-sm text-sm">
              Book a Demo
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-16 flex flex-col items-center gap-4">
            <div className="flex -space-x-2">
              {[
                'from-teal-400 to-teal-600',
                'from-blue-400 to-blue-600',
                'from-violet-400 to-violet-600',
                'from-teal-400 to-blue-600',
                'from-blue-400 to-violet-600',
              ].map((gradient, i) => (
                <div key={i} className={`h-8 w-8 rounded-full bg-gradient-to-br ${gradient} border-2 border-[#0A0A1A] flex items-center justify-center`}>
                  <span className="text-[10px] font-medium text-white">{String.fromCharCode(65 + i)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-teal-400 text-teal-400" />
              ))}
              <span className="text-sm text-slate-500 ml-2">4.9/5 from 500+ reviews</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative max-w-5xl mx-auto px-6 mt-20">
          {/* Glow behind preview */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-violet-500/10 rounded-xl blur-xl" />

          <div className="relative rounded-xl border border-white/10 bg-[#0E0E22]/80 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Window Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <div className="h-3 w-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-white/5 text-xs text-slate-500">app.onekof.com/dashboard</div>
              </div>
            </div>
            {/* Content */}
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { label: 'Active Projects', value: '24', change: '+3 this week', color: 'teal', icon: FolderKanban },
                { label: 'Tasks Completed', value: '1,248', change: '94% on time', color: 'blue', icon: CheckCircle2 },
                { label: 'Team Velocity', value: '87%', change: '+12% vs last sprint', color: 'violet', icon: TrendingUp },
              ].map((stat) => {
                const colorMap: Record<string, string> = {
                  teal: 'text-teal-400 bg-teal-400/10',
                  blue: 'text-blue-400 bg-blue-400/10',
                  violet: 'text-violet-400 bg-violet-400/10',
                };
                const changeColor: Record<string, string> = {
                  teal: 'text-teal-400',
                  blue: 'text-blue-400',
                  violet: 'text-violet-400',
                };
                return (
                  <div key={stat.label} className="rounded-lg bg-white/5 border border-white/5 p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
                      <div className={`h-7 w-7 rounded-lg ${colorMap[stat.color]} flex items-center justify-center`}>
                        <stat.icon className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className={`text-xs ${changeColor[stat.color]} mt-1`}>{stat.change}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Built different.{' '}
              <span className="bg-gradient-to-r from-teal-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">Built for you.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Every feature designed for how Ethiopian organizations actually work.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: 'Ethiopian Calendar',
                description: 'Native support for the Ethiopian calendar system. Plan sprints, set deadlines, and track milestones in the calendar your team actually uses.',
                gradient: 'from-teal-500 to-teal-600',
                glow: 'group-hover:shadow-teal-500/20',
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Role-based access control, audit logs, SSO integration, and data sovereignty options for government organizations.',
                gradient: 'from-blue-500 to-blue-600',
                glow: 'group-hover:shadow-blue-500/20',
              },
              {
                icon: BarChart3,
                title: 'ETB Budgeting',
                description: 'Track project budgets in Ethiopian Birr with real-time expense monitoring, forecasting, and approval workflows.',
                gradient: 'from-violet-500 to-violet-600',
                glow: 'group-hover:shadow-violet-500/20',
              },
              {
                icon: Zap,
                title: 'AI-Powered Insights',
                description: 'Intelligent risk detection, workload balancing suggestions, and automated progress reports powered by AI.',
                gradient: 'from-teal-500 to-blue-500',
                glow: 'group-hover:shadow-teal-500/20',
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Real-time task updates, threaded comments, file sharing, and @mentions. Keep everyone aligned without the noise.',
                gradient: 'from-blue-500 to-violet-500',
                glow: 'group-hover:shadow-blue-500/20',
              },
              {
                icon: Layers,
                title: 'White-Label Ready',
                description: 'Custom domains, branded login pages, and organizational theming. Make Onekof look like your own platform.',
                gradient: 'from-violet-500 to-teal-500',
                glow: 'group-hover:shadow-violet-500/20',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`group rounded-xl bg-white/[0.02] border border-white/5 p-6 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 hover:shadow-xl ${feature.glow}`}
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} mb-4 shadow-lg`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-400 text-lg">Start free. Scale as you grow.</p>
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
                className={`rounded-xl p-6 relative ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-blue-500/10 via-violet-500/5 to-transparent border border-blue-500/30 shadow-xl shadow-blue-500/10'
                    : 'bg-white/[0.02] border border-white/5'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-teal-400 via-blue-500 to-violet-500 text-white text-xs font-semibold shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-slate-500 text-sm">{plan.period}</span>}
                </div>
                <button
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all mb-6 ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-teal-400 via-blue-500 to-violet-500 text-white hover:opacity-90 shadow-lg shadow-blue-500/20'
                      : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {plan.cta}
                </button>
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-teal-400 shrink-0" />
                      <span className="text-sm text-slate-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          {/* Aurora glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[500px] h-[300px] bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-violet-500/10 rounded-full blur-[80px]" />
          </div>

          <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-12 backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to transform how your team works?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Join 200+ Ethiopian organizations already using Onekof.
            </p>
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-400 via-blue-500 to-violet-500 text-white font-semibold px-8 py-3.5 rounded-lg hover:opacity-90 transition-all shadow-xl shadow-blue-500/25 text-sm">
              Start Your Free Trial
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-teal-400 via-blue-500 to-violet-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">O</span>
              </div>
              <span className="text-sm font-semibold text-white">Onekof</span>
            </div>
            <p className="text-xs text-slate-600">&copy; 2024 Onekof. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── DASHBOARD PAGE ──────────────────────────────────────────

function DashboardPage() {
  const navItems = [
    { icon: Home, label: 'Dashboard', active: true, color: 'text-teal-400' },
    { icon: FolderKanban, label: 'Projects', active: false, color: 'text-blue-400' },
    { icon: ListTodo, label: 'My Tasks', active: false, color: 'text-violet-400' },
    { icon: Target, label: 'Goals', active: false, color: 'text-teal-400' },
    { icon: PieChart, label: 'Reports', active: false, color: 'text-blue-400' },
    { icon: Users, label: 'Team', active: false, color: 'text-violet-400' },
    { icon: Settings, label: 'Settings', active: false, color: 'text-slate-400' },
  ];

  const tasks = [
    { title: 'Review Q4 budget proposal', project: 'Finance', priority: 'high', status: 'in-progress', assignee: 'AT', due: '2 days' },
    { title: 'Update API documentation', project: 'Engineering', priority: 'medium', status: 'todo', assignee: 'MK', due: '5 days' },
    { title: 'Prepare stakeholder presentation', project: 'Marketing', priority: 'high', status: 'in-progress', assignee: 'SB', due: 'Tomorrow' },
    { title: 'Database migration testing', project: 'Engineering', priority: 'low', status: 'done', assignee: 'DL', due: 'Done' },
    { title: 'User research interviews', project: 'Product', priority: 'medium', status: 'todo', assignee: 'NK', due: '1 week' },
  ];

  const priorityColors: Record<string, string> = {
    high: 'text-rose-400 bg-rose-400/10',
    medium: 'text-blue-400 bg-blue-400/10',
    low: 'text-teal-400 bg-teal-400/10',
  };

  const statusIcons: Record<string, React.ReactNode> = {
    'todo': <Circle className="h-4 w-4 text-slate-500" />,
    'in-progress': <Clock className="h-4 w-4 text-blue-400" />,
    'done': <CheckCircle2 className="h-4 w-4 text-teal-400" />,
  };

  return (
    <div className="min-h-screen bg-[#0A0A1A] flex">
      {/* Sidebar */}
      <aside className="w-60 border-r border-white/5 bg-[#0E0E22] flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-white/5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 via-blue-500 to-violet-500 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="text-sm font-semibold text-white">Onekof</span>
        </div>

        {/* Org Switcher */}
        <div className="px-3 py-3 border-b border-white/5">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">M</span>
            </div>
            <span className="text-sm text-slate-300 flex-1 text-left truncate">Ministry of Tech</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-600" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all ${
                item.active
                  ? 'bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-violet-500/10 text-white font-medium border border-white/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${item.active ? 'text-teal-400' : ''}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Gradient accent line */}
        <div className="mx-3 h-px bg-gradient-to-r from-teal-500/50 via-blue-500/50 to-violet-500/50" />

        {/* User */}
        <div className="px-3 py-3">
          <div className="flex items-center gap-2 px-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">O</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">Oli Tamrat</p>
              <p className="text-[10px] text-slate-500 truncate">oli@onekof.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-14 border-b border-white/5 bg-[#0E0E22] flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-white">Dashboard</h1>
            <span className="text-xs text-slate-700">/</span>
            <span className="text-xs text-slate-500">Overview</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <Search className="h-4 w-4 text-slate-500" />
            </button>
            <button className="h-8 w-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors relative">
              <Bell className="h-4 w-4 text-slate-500" />
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 text-[9px] font-bold text-white flex items-center justify-center">3</div>
            </button>
            <button className="h-8 flex items-center gap-2 px-3 rounded-lg bg-gradient-to-r from-teal-400 via-blue-500 to-violet-500 text-white text-xs font-medium hover:opacity-90 transition-all shadow-lg shadow-blue-500/20">
              <Plus className="h-3.5 w-3.5" />
              New Task
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Active Projects', value: '12', change: '+2', icon: FolderKanban, color: 'teal' },
              { label: 'Open Tasks', value: '47', change: '-5', icon: ListTodo, color: 'blue' },
              { label: 'Team Members', value: '24', change: '+1', icon: Users, color: 'violet' },
              { label: 'Completion Rate', value: '87%', change: '+4%', icon: TrendingUp, color: 'teal' },
            ].map((stat) => {
              const iconColors: Record<string, string> = {
                teal: 'text-teal-400 bg-teal-400/10',
                blue: 'text-blue-400 bg-blue-400/10',
                violet: 'text-violet-400 bg-violet-400/10',
              };
              return (
                <div key={stat.label} className="rounded-xl bg-white/[0.02] border border-white/5 p-4 hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
                    <div className={`h-8 w-8 rounded-lg ${iconColors[stat.color]} flex items-center justify-center`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">{stat.value}</span>
                    <span className="text-xs font-medium text-teal-400">{stat.change}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Task List */}
            <div className="col-span-2 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="text-sm font-semibold text-white">Recent Tasks</h2>
                <button className="text-xs bg-gradient-to-r from-teal-300 via-blue-400 to-violet-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity font-medium">
                  View All
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {tasks.map((task) => (
                  <div key={task.title} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                    {statusIcons[task.status]}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">{task.project}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                      <span className="text-[10px] font-medium text-slate-400">{task.assignee}</span>
                    </div>
                    <span className="text-xs text-slate-600 w-16 text-right">{task.due}</span>
                    <button className="text-slate-600 hover:text-slate-400">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Activity */}
              <div className="rounded-xl bg-white/[0.02] border border-white/5">
                <div className="px-5 py-4 border-b border-white/5">
                  <h2 className="text-sm font-semibold text-white">Activity</h2>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { user: 'AT', action: 'completed', target: 'Database migration', time: '2m ago', color: 'from-teal-400 to-teal-600' },
                    { user: 'SB', action: 'commented on', target: 'Budget review', time: '15m ago', color: 'from-blue-400 to-blue-600' },
                    { user: 'MK', action: 'created', target: 'API docs task', time: '1h ago', color: 'from-violet-400 to-violet-600' },
                    { user: 'NK', action: 'moved', target: 'User research to In Progress', time: '2h ago', color: 'from-teal-400 to-blue-600' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`h-6 w-6 rounded-full bg-gradient-to-br ${activity.color} flex items-center justify-center shrink-0 mt-0.5`}>
                        <span className="text-[10px] font-medium text-white">{activity.user}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400">
                          <span className="text-slate-300 font-medium">{activity.user}</span>
                          {' '}{activity.action}{' '}
                          <span className="text-blue-400">{activity.target}</span>
                        </p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-5">
                <h2 className="text-sm font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Plus, label: 'New Task', color: 'text-teal-400' },
                    { icon: FolderKanban, label: 'New Project', color: 'text-blue-400' },
                    { icon: Users, label: 'Invite Member', color: 'text-violet-400' },
                    { icon: MessageSquare, label: 'Send Update', color: 'text-teal-400' },
                  ].map((action) => (
                    <button
                      key={action.label}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.06] transition-all"
                    >
                      <action.icon className={`h-4 w-4 ${action.color}`} />
                      <span className="text-[10px] text-slate-400 font-medium">{action.label}</span>
                    </button>
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

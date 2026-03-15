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
  TrendingUp,
  Timer,
  Crown,
  ArrowUpRight,
  Minus,
  FileText,
  Brain,
  Clock,
  ChevronLeft,
  Wallet,
  Wand2,
  LayoutDashboard,
  ListChecks,
  GanttChart,
} from 'lucide-react';

/* ─── Hooks ─── */
function useInView(threshold = 0.12) {
  Plus,
  Minus,
  MessageSquare,
} from 'lucide-react';

/* ─── Hooks & Utilities ─── */
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
  const { ref, inView } = useInView(0.08);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : 'translateY(28px)',
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
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

/* ─── Data ─── */
const showcaseTabs = [
  {
    id: 'budget',
    label: 'Budget Builder',
    icon: Wallet,
    tagline: 'ETB-native financial tracking',
    title: 'All-in-one Budget Builder',
    desc: 'Track every Birr across projects. Create budgets, manage expenses, approve payments, and generate financial reports — all natively in Ethiopian Birr.',
    features: ['Create & track budgets in ETB', 'Expense approvals with role-based workflow', 'Real-time spending vs. budget comparison', 'Export financial reports for stakeholders'],
  },
  {
    id: 'ai-docs',
    label: 'AI Documents',
    icon: Brain,
    tagline: 'Intelligent document processing',
    title: 'AI-Powered Document Processor',
    desc: 'Upload contracts, proposals, or reports and let AI extract key data, summarize content, flag risks, and auto-link to relevant project tasks.',
    features: ['Auto-extract key terms & deadlines', 'Summarize lengthy documents in seconds', 'Flag contractual risks & obligations', 'Auto-link documents to project tasks'],
  },
  {
    id: 'calendar',
    label: 'Ethiopian Calendar',
    icon: Calendar,
    tagline: 'Plan in your own calendar',
    title: 'Native Ethiopian Calendar',
    desc: 'The only project management tool with a true Ethiopian calendar. Plan sprints in Meskerem, set deadlines in Pagume, track holidays, and toggle Gregorian seamlessly.',
    features: ['Full 13-month Ethiopian calendar', 'Holiday markers & cultural events', 'Sprint planning with Ethiopian dates', 'Seamless Gregorian ↔ Ethiopian toggle'],
  },
  {
    id: 'language',
    label: 'Multi-language',
    icon: Languages,
    tagline: '4 Ethiopian languages built in',
    title: 'Multilingual Interface',
    desc: 'Every label, button, notification, and report is available in Amharic, Afaan Oromoo, Tigrinya, and English. Human-translated, not machine-generated.',
    features: ['Full Amharic (አማርኛ) interface', 'Full Afaan Oromoo interface', 'Full Tigrinya (ትግርኛ) interface', 'Per-user language preferences'],
  },
];

const plans = [
  {
    name: 'Free',
    desc: 'For small teams getting started',
    price: 0,
    yearlyPrice: 0,
    features: ['Up to 10 users', '3 projects', 'Kanban & list views', 'Ethiopian calendar', '4 languages', 'Basic reports'],
    cta: 'Get started free',
    highlighted: false,
  },
  {
    name: 'Pro',
    desc: 'For growing teams that need more',
    price: 2500,
    yearlyPrice: 1999,
    features: ['Unlimited users', 'Unlimited projects', 'All views + Timeline', 'Automations & workflows', 'Budget tracking (ETB)', 'Goals & OKRs', 'AI Document Processor', 'Advanced analytics', 'Priority support'],
    cta: 'Start 14-day free trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    desc: 'For large organizations',
    price: null,
    yearlyPrice: null,
    features: ['Everything in Pro', 'SSO & SAML', 'Advanced security & audit logs', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee', 'On-premise deployment', 'Custom training & onboarding'],
    cta: 'Contact sales',
    highlighted: false,
  },
];

/* ─── Sub-components for product showcases ─── */
function BudgetMockup() {
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] font-medium text-white/70">Project Budget — Q2 2017 E.C.</h4>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">On Track</span>
      </div>
      <div className="space-y-3">
        {[
          { label: 'Development', spent: 245000, budget: 400000, pct: 61 },
          { label: 'Design & UX', spent: 85000, budget: 120000, pct: 71 },
          { label: 'Infrastructure', spent: 32000, budget: 80000, pct: 40 },
          { label: 'Marketing', spent: 15000, budget: 50000, pct: 30 },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-medium text-white/60">{item.label}</span>
              <span className="text-[11px] text-white/30">
                {item.spent.toLocaleString()} / {item.budget.toLocaleString()} ETB
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  item.pct > 70 ? 'bg-amber-500' : 'bg-brand-500'
                }`}
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-lg border border-brand-500/20 bg-brand-500/[0.06] p-3">
        <div>
          <p className="text-[11px] text-white/40">Total Spent</p>
          <p className="text-[16px] font-semibold text-white">377,000 ETB</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-white/40">Remaining</p>
          <p className="text-[16px] font-semibold text-emerald-400">273,000 ETB</p>
        </div>
      </div>
    </div>
  );
}

function AIDocsMockup() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
          <FileText className="h-5 w-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-medium text-white/70">Procurement_Contract_Q2.pdf</p>
          <p className="text-[11px] text-white/30">Uploaded 2 minutes ago • 24 pages</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-brand-500/10 px-2 py-1">
          <Sparkles className="h-3 w-3 text-brand-400" />
          <span className="text-[10px] font-medium text-brand-400">Processing</span>
        </div>
      </div>
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center gap-2">
          <Wand2 className="h-3.5 w-3.5 text-brand-400" />
          <span className="text-[12px] font-medium text-white/60">AI Summary</span>
        </div>
        <p className="text-[12px] leading-relaxed text-white/40">
          Service agreement for cloud infrastructure (Deadline: Sene 15, 2017). Key: 24-month term, auto-renewal, 2.4M ETB annual value. 3 risk flags identified.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Deadlines', value: '4', icon: Clock },
          { label: 'Risk Flags', value: '3', icon: Shield },
          { label: 'Tasks Linked', value: '7', icon: ListChecks },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-center">
            <item.icon className="mx-auto mb-1 h-3.5 w-3.5 text-white/25" />
            <p className="text-[14px] font-semibold text-white/70">{item.value}</p>
            <p className="text-[10px] text-white/25">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarMockup() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-white/70">መጋቢት 2017</span>
        <div className="flex gap-1">
          <button className="rounded-md p-1.5 text-white/20 transition-colors hover:bg-white/[0.05]">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button className="rounded-md p-1.5 text-white/20 transition-colors hover:bg-white/[0.05]">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {['ሰ', 'ማ', 'ረ', 'ሐ', 'አ', 'ቅ', 'እ'].map((d) => (
          <div key={d} className="py-2 text-center text-[11px] font-medium text-white/20">{d}</div>
        ))}
        {Array.from({ length: 30 }, (_, i) => {
          const isToday = i === 5;
          const isDeadline = i === 14;
          const isHoliday = i === 22;
          const hasDot = i === 8 || i === 19;
          return (
            <div
              key={i}
              className={`relative flex h-8 items-center justify-center rounded-md text-[12px] transition-all ${
                isToday ? 'bg-brand-600 font-semibold text-white shadow-brand-sm' :
                isDeadline ? 'bg-red-500/10 font-medium text-red-400' :
                isHoliday ? 'bg-amber-500/10 font-medium text-amber-400' :
                'text-white/40 hover:bg-white/[0.04]'
              }`}
            >
              {i + 1}
              {hasDot && <div className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-400" />}
            </div>
          );
        })}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 rounded-md bg-brand-500/8 border border-brand-500/10 px-3 py-2">
          <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          <span className="text-[11px] text-brand-300">Sprint 14 Review — መጋ 6</span>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-red-500/8 border border-red-500/10 px-3 py-2">
          <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
          <span className="text-[11px] text-red-300">API v2 Deadline — መጋ 15</span>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-amber-500/8 border border-amber-500/10 px-3 py-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="text-[11px] text-amber-300">Adwa Victory Day — መጋ 23</span>
        </div>
      </div>
    </div>
  );
}

function LanguageMockup() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {[
          { lang: 'አማርኛ', flag: '🇪🇹', sample: 'ፕሮጀክት አስተዳደር', sublabel: 'Project Management' },
          { lang: 'English', flag: '🇬🇧', sample: 'Create New Task', sublabel: 'Create New Task' },
          { lang: 'Afaan Oromoo', flag: '🇪🇹', sample: 'Hojii Haaraa Uumi', sublabel: 'Create New Task' },
          { lang: 'ትግርኛ', flag: '🇪🇹', sample: 'ሓድሽ ዕማም ፍጠር', sublabel: 'Create New Task' },
        ].map((item, i) => (
          <div
            key={item.lang}
            className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
              i === 0 ? 'border-brand-500/20 bg-brand-500/[0.06]' : 'border-white/[0.06] bg-white/[0.02]'
            }`}
          >
            <span className="text-lg">{item.flag}</span>
            <div className="flex-1">
              <p className="text-[12px] font-medium text-white/70">{item.lang}</p>
              <p className="text-[11px] text-white/30">{item.sample}</p>
            </div>
            {i === 0 && (
              <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-medium text-brand-400">Active</span>
            )}
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
        <p className="mb-2 text-[11px] font-medium text-white/40">UI Preview — አማርኛ</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 rounded-md bg-white/[0.04] px-3 py-2">
            <LayoutDashboard className="h-3.5 w-3.5 text-white/30" />
            <span className="text-[12px] text-white/50">ዳሽቦርድ</span>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-brand-500/10 px-3 py-2">
            <Kanban className="h-3.5 w-3.5 text-brand-400" />
            <span className="text-[12px] font-medium text-brand-400">ፕሮጀክቶች</span>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-white/[0.04] px-3 py-2">
            <Calendar className="h-3.5 w-3.5 text-white/30" />
            <span className="text-[12px] text-white/50">የኢትዮጵያ ቀን መቁጠሪያ</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Blur-in Reveal (Linear-style entrance) ─── */
function BlurReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${inView ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-6 opacity-0 blur-sm'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Linear-style Cursor Glow Card Grid ─── */
function GlowGrid({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const cards = container.querySelectorAll<HTMLElement>('[data-glow-card]');
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
    });
  }, []);

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove} className={className}>
      {children}
    </div>
  );
}

/* ─── FAQ Item ─── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-surface-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-base font-semibold text-midnight-800 pr-4">{q}</span>
        {open ? <Minus className="h-5 w-5 flex-shrink-0 text-brand-500" /> : <Plus className="h-5 w-5 flex-shrink-0 text-midnight-300" />}
      </button>
      <div className={`faq-content ${open ? 'open' : ''}`}>
        <div>
          <p className="pb-5 text-sm leading-relaxed text-midnight-400">{a}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeShowcase, setActiveShowcase] = useState(0);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [heroTyped, setHeroTyped] = useState('');

  const heroWords = ['ship faster', 'track budgets', 'plan sprints', 'collaborate'];
  const [heroWordIndex, setHeroWordIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [activePricing, setActivePricing] = useState<'monthly' | 'yearly'>('yearly');
  const [heroWord, setHeroWord] = useState(0);

  const heroWords = ['ship faster', 'collaborate better', 'deliver on time', 'scale effortlessly'];
  const languageMap: Record<string, string> = { en: 'English', am: 'አማርኛ', om: 'Afaan Oromoo', ti: 'ትግርኛ' };

  const getCurrentLocale = useCallback(() => {
    if (typeof document !== 'undefined') {
      const m = document.cookie.match(/NEXT_LOCALE=(\w+)/);
      return m ? m[1] : 'en';
    }
    return 'en';
  }, []);
  const [selectedLang, setSelectedLang] = useState(() => languageMap[getCurrentLocale()] || 'English');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  useEffect(() => {
    const timer = setInterval(() => setActiveShowcase((t) => (t + 1) % showcaseTabs.length), 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setHeroWord((w) => (w + 1) % heroWords.length), 3000);
    return () => clearInterval(timer);
  }, [heroWords.length]);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Product', href: '#product' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
  ];

  const showcaseMockups = [<BudgetMockup />, <AIDocsMockup />, <CalendarMockup />, <LanguageMockup />];

  return (
    <div className="min-h-screen bg-midnight-950 text-white selection:bg-brand-500/20">
      {/* ═══ NAVBAR ═══ */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b border-white/[0.06] bg-midnight-950/70 backdrop-blur-2xl backdrop-saturate-150'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 shadow-brand-sm transition-shadow group-hover:shadow-brand-md">
              <span className="text-sm font-black text-white">O</span>
            </div>
            <span className="text-[15px] font-semibold tracking-[-0.01em]">Onekof</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-[13px] text-white/40 transition-all hover:bg-white/[0.04] hover:text-white/80"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/auth/signin"
              className="rounded-lg px-3.5 py-2 text-[13px] text-white/40 transition-colors hover:text-white/80"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="group relative overflow-hidden rounded-lg bg-white px-4.5 py-2 text-[13px] font-medium text-midnight-950 transition-all hover:shadow-lg hover:shadow-white/10"
            >
              <span className="relative z-10">Get started</span>
            </Link>
  const productTabs = [
    { label: 'Board View', icon: Kanban, content: { title: 'Visualize work with Kanban boards', desc: 'Drag and drop tasks through custom workflows. See progress at a glance with cards that show assignees, priorities, labels, and due dates.' } },
    { label: 'Ethiopian Calendar', icon: Calendar, content: { title: 'Plan in the calendar you actually use', desc: 'Full Ethiopian calendar integration with Amharic month names, holiday markers, and deadline tracking. Toggle between Ethiopian and Gregorian seamlessly.' } },
    { label: 'Automation', icon: Workflow, content: { title: 'Automate repetitive work', desc: 'Create powerful automations with a visual builder. When a task moves to "In Review", assign reviewers automatically. When a sprint ends, generate reports instantly.' } },
    { label: 'Analytics', icon: BarChart3, content: { title: 'Real-time project insights', desc: 'Track velocity, burndown charts, team performance, and budget utilization with live dashboards. Export reports in PDF or share with stakeholders directly.' } },
  ];

  const integrations = [
    { name: 'Slack', icon: MessageSquare, color: 'from-[#4A154B] to-[#611f69]' },
    { name: 'GitHub', icon: Layers, color: 'from-[#24292e] to-[#40464d]' },
    { name: 'Google Workspace', icon: Globe, color: 'from-[#4285F4] to-[#34A853]' },
    { name: 'Telegram', icon: MessageSquare, color: 'from-[#0088cc] to-[#29b6f6]' },
    { name: 'Microsoft Teams', icon: Users, color: 'from-[#464EB8] to-[#6264A7]' },
    { name: 'Figma', icon: PieChart, color: 'from-[#F24E1E] to-[#A259FF]' },
    { name: 'VS Code', icon: Layers, color: 'from-[#007ACC] to-[#1f9cf0]' },
    { name: 'Jira Import', icon: ArrowRight, color: 'from-[#0052CC] to-[#2684FF]' },
  ];

  const faqs = [
    { q: 'What is Onekof?', a: 'Onekof is a modern project management platform purpose-built for Ethiopian teams. It combines task management, Kanban boards, budget tracking in ETB, Ethiopian calendar integration, and multi-language support (Amharic, Oromo, Tigrinya, English) in one powerful workspace.' },
    { q: 'Is there a free plan?', a: 'Yes! Onekof is free forever for small teams. You get up to 10 users, 3 projects, Kanban & list views, Ethiopian calendar, all 4 language options, and basic reports — no credit card required.' },
    { q: 'Does Onekof support the Ethiopian calendar?', a: 'Absolutely. Onekof is the only project management tool with native Ethiopian calendar support. Plan sprints around Pagume, set deadlines in Meskerem, view holidays, and toggle between Ethiopian and Gregorian calendars seamlessly.' },
    { q: 'What languages are supported?', a: 'The entire interface is available in English, Amharic (አማርኛ), Afaan Oromoo, and Tigrinya (ትግርኛ). Every label, button, notification, and report can be used in your preferred language.' },
    { q: 'Can I import data from Jira or Trello?', a: 'Yes. Onekof provides one-click import tools for Jira, Trello, Asana, and CSV files. Your projects, tasks, labels, and team assignments transfer automatically.' },
    { q: 'Is my data secure?', a: 'Security is a top priority. Onekof includes role-based access control, two-factor authentication, session management, encrypted data at rest and in transit, and full audit logs. Enterprise plans include SSO/SAML and SOC 2 compliance.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ═══ NAVBAR ═══ */}
      <nav className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled ? 'border-b border-brand-100/60 bg-white/90 backdrop-blur-2xl shadow-sm' : 'bg-transparent'}`}>
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
                <a key={item.label} href={item.href} className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${scrolled ? 'text-midnight-400 hover:bg-brand-50 hover:text-brand-600' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <button onClick={() => setLangOpen(!langOpen)} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all ${scrolled ? 'text-midnight-400 hover:bg-brand-50' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
                <Globe className="h-4 w-4" /><span className="hidden md:inline">{selectedLang}</span><ChevronDown className={`h-3 w-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1.5 w-44 rounded-xl border border-brand-100 bg-white py-1 shadow-xl shadow-brand-900/10">
                    {Object.entries(languageMap).map(([code, name]) => (
                      <button key={code} onClick={() => { setSelectedLang(name); setLangOpen(false); document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000;samesite=lax`; window.location.reload(); }}
                        className={`flex w-full items-center px-4 py-2.5 text-sm transition-colors ${selectedLang === name ? 'bg-brand-50 font-semibold text-brand-600' : 'text-midnight-600 hover:bg-surface-100'}`}>{name}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <Link href="/auth/signin" className={`hidden rounded-lg px-4 py-2 text-sm font-medium transition-all sm:inline-flex ${scrolled ? 'text-midnight-500 hover:bg-brand-50 hover:text-brand-600' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>Log in</Link>
            <Link href="/auth/signup" className="rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-brand-sm transition-all hover:shadow-brand-md hover:brightness-110 active:scale-[0.98]">Get started free</Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className={`ml-1 rounded-lg p-2 lg:hidden ${scrolled ? 'text-midnight-600 hover:bg-brand-50' : 'text-white/80 hover:bg-white/10'}`} aria-label="Toggle menu">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden" aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5 text-white/60" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="animate-in slide-in-from-top border-t border-white/[0.06] bg-midnight-950/98 backdrop-blur-2xl md:hidden">
            <div className="space-y-1 px-6 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg py-2.5 text-[15px] text-white/50 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t border-white/[0.06] pt-4">
                <Link href="/auth/signin" className="py-2.5 text-[15px] text-white/50">Log in</Link>
                <Link href="/auth/signup" className="rounded-lg bg-white px-4 py-2.5 text-center text-[15px] font-medium text-midnight-950">
                  Get started
                </Link>
              </div>
        {mobileOpen && (
          <div className="border-t border-brand-100 bg-white lg:hidden">
            <div className="mx-auto max-w-7xl space-y-1 px-5 py-4">
              {navLinks.map((item) => (<a key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-4 py-3 text-sm font-medium text-midnight-600 hover:bg-brand-50">{item.label}</a>))}
              <div className="border-t border-brand-100 pt-3">
                <Link href="/auth/signin" className="block rounded-lg px-4 py-3 text-sm font-medium text-midnight-600 hover:bg-brand-50">Log in</Link>
                <Link href="/auth/signup" className="mt-1 block rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-4 py-3 text-center text-sm font-semibold text-white">Get started free</Link>
              </div>
              <div className="border-t border-brand-100 pt-3">
                <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wider text-midnight-300">Language</p>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(languageMap).map(([code, name]) => (
                    <button key={code} onClick={() => { setSelectedLang(name); document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000;samesite=lax`; window.location.reload(); }}
                      className={`rounded-lg px-3 py-2 text-sm ${selectedLang === name ? 'bg-brand-50 font-semibold text-brand-600' : 'text-midnight-500 hover:bg-surface-100'}`}>{name}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[800px] w-[1200px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)]" />
          <div className="absolute left-1/4 top-40 h-[400px] w-[400px] rounded-full bg-purple-500/[0.04] blur-[120px]" />
          <div className="absolute right-1/4 top-60 h-[300px] w-[300px] rounded-full bg-brand-500/[0.04] blur-[100px]" />
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-32 text-center sm:pt-40 lg:pt-48">
          <Reveal>
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 backdrop-blur-sm transition-all hover:border-white/[0.12] hover:bg-white/[0.05]">
              <div className="relative h-2 w-2">
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
                <div className="relative h-2 w-2 rounded-full bg-emerald-400" />

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-midnight-900 via-midnight-800 to-brand-950" />
        <div className="pointer-events-none absolute inset-0 mesh-gradient" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-brand-600/20 blur-[120px] animate-pulse-slow" />
          <div className="absolute -right-40 top-40 h-[400px] w-[400px] rounded-full bg-purple-600/15 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute left-1/3 top-2/3 h-[300px] w-[300px] rounded-full bg-accent-coral/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: '4s' }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="pb-16 pt-28 text-center sm:pt-36 lg:pt-44">
            <Reveal>
              <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 backdrop-blur-sm">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-accent-coral to-accent-gold">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-medium text-brand-200">The #1 project management tool built for Ethiopia</span>
                <ArrowRight className="h-3.5 w-3.5 text-brand-400" />
              </div>
              <span className="text-[13px] text-white/50">The #1 project management platform built for Ethiopia</span>
              <ArrowRight className="h-3 w-3 text-white/30" />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="mx-auto max-w-4xl text-[clamp(2.5rem,6.5vw,5rem)] font-semibold leading-[1.05] tracking-[-0.04em]">
              One platform to
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-brand-300 bg-clip-text text-transparent">
                  {heroTyped}
                </span>
                <span className="ml-0.5 inline-block h-[0.9em] w-[3px] animate-pulse rounded-full bg-brand-400 align-middle" />
              </span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-white/35 sm:text-[18px]">
              Projects, tasks, budgets, documents, and dashboards in one workspace.
              Native Ethiopian calendar, local languages, ETB currency, and workflows
              built for how Ethiopian teams actually work.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/signup"
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-7 py-3.5 text-[14px] font-medium text-white shadow-brand-lg transition-all hover:shadow-brand-xl hover:brightness-110 active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  Get started — it&apos;s free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <a
                href="#product"
                className="group inline-flex items-center gap-2.5 rounded-xl border border-white/[0.1] px-7 py-3.5 text-[14px] font-medium text-white/50 backdrop-blur-sm transition-all hover:border-white/[0.2] hover:bg-white/[0.04] hover:text-white/80"
              >
                <Play className="h-3.5 w-3.5 text-brand-400" />
                Watch demo
              </a>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
              {['Free forever for small teams', 'No credit card required', 'Setup in 2 minutes'].map((text) => (
                <span key={text} className="flex items-center gap-1.5 text-[13px] text-white/25">
                  <Check className="h-3.5 w-3.5 text-white/15" />
                  {text}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ─── Dashboard Preview ─── */}
        <Reveal delay={500}>
          <div className="relative mx-auto max-w-6xl px-6 pb-28">
            <div className="absolute -inset-8 rounded-3xl bg-gradient-to-b from-brand-500/[0.08] via-purple-500/[0.04] to-transparent blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-midnight-900/60 shadow-2xl shadow-black/50 ring-1 ring-white/[0.04]">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 border-b border-white/[0.06] bg-midnight-900/80 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#27C93F]/80" />
                </div>
                <div className="mx-auto flex h-7 w-72 items-center justify-center rounded-lg bg-white/[0.04] text-[11px] text-white/20">
                  <Shield className="mr-1.5 h-3 w-3" />
                  app.onekof.com/projects/sprint-14
            <BlurReveal delay={100}>
              <h1 className="mx-auto max-w-5xl text-4xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                One powerful platform to{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-brand-300 bg-clip-text text-transparent transition-all duration-500">
                    {heroWords[heroWord]}
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 286 8" fill="none">
                    <path d="M2 6C70 2 216 2 284 6" stroke="url(#ug)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                    <defs><linearGradient id="ug" x1="0" y1="0" x2="286" y2="0"><stop offset="0%" stopColor="#818CF8" /><stop offset="100%" stopColor="#A78BFA" /></linearGradient></defs>
                  </svg>
                </span>
              </h1>
            </BlurReveal>

            <BlurReveal delay={200}>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-midnight-200 sm:text-xl">
                Projects, tasks, goals, budgets, docs, and dashboards — all in one workspace.
                Built natively for Ethiopian teams with the calendar, languages, and workflows you need.
              </p>
            </BlurReveal>

            <Reveal delay={300}>
              <div className="mx-auto mt-10 max-w-lg">
                <div className="flex rounded-2xl border border-white/10 bg-white/[0.06] p-1.5 backdrop-blur-sm shadow-glow">
                  <input
                    type="email"
                    placeholder="Enter your work email"
                    className="flex-1 rounded-xl border-0 bg-white px-5 py-3.5 text-sm font-medium text-midnight-800 placeholder-midnight-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button className="ml-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-brand-md transition-all hover:shadow-brand-lg hover:brightness-110 active:scale-[0.98]">
                    Get started free
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                  {['Free forever', 'No credit card', 'Setup in 2 min'].map((text) => (
                    <span key={text} className="flex items-center gap-1.5 text-xs text-midnight-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-400/60" />
                      {text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="flex min-h-[460px] sm:min-h-[520px]">
                {/* Sidebar */}
                <div className="hidden w-56 border-r border-white/[0.06] bg-midnight-950/60 p-4 lg:block">
                  <div className="mb-6 flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 text-[10px] font-bold shadow-sm">T</div>
                    <div>
                      <span className="text-[12px] font-medium text-white/70">TechEth</span>
                      <p className="text-[10px] text-white/25">Professional</p>
                    </div>
                  </div>
                  {[
                    { icon: LayoutDashboard, label: 'ዳሽቦርድ', active: false },
                    { icon: Kanban, label: 'ፕሮጀክቶች', active: true },
                    { icon: Calendar, label: 'ቀን መቁጠሪያ', active: false },
                    { icon: Users, label: 'ቡድን', active: false },
                    { icon: Wallet, label: 'በጀት', active: false },
                    { icon: FileText, label: 'ሰነዶች', active: false },
                    { icon: BarChart3, label: 'ሪፖርቶች', active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] transition-colors ${
                        item.active
                          ? 'bg-brand-500/10 font-medium text-brand-400'
                          : 'text-white/30 hover:bg-white/[0.03] hover:text-white/50'
                      }`}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Main */}
                <div className="flex-1 p-5 sm:p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-[14px] font-medium text-white/80">Sprint 14 — Website Redesign</h3>
                      <p className="mt-0.5 text-[11px] text-white/25">መጋቢት 1 – 15, 2017 E.C.</p>
                    </div>
                    <div className="flex gap-1.5">
                      {[
                        { label: 'Board', active: true },
                        { label: 'List', active: false },
                        { label: 'Timeline', active: false },
                        { label: 'Calendar', active: false },
                      ].map((v) => (
                        <div
                          key={v.label}
                          className={`rounded-lg px-3 py-1.5 text-[11px] transition-colors ${
                            v.active ? 'bg-white/[0.08] font-medium text-white/70' : 'text-white/20 hover:bg-white/[0.04]'
                          }`}
                        >
                          {v.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="mb-5 grid grid-cols-4 gap-3">
                    {[
                      { label: 'Total Tasks', value: '34', color: 'text-white/70' },
                      { label: 'In Progress', value: '8', color: 'text-brand-400' },
                      { label: 'Completed', value: '18', color: 'text-emerald-400' },
                      { label: 'Budget Used', value: '58%', color: 'text-amber-400' },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                        <p className="text-[10px] text-white/25">{s.label}</p>
                        <p className={`text-[16px] font-semibold ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Kanban */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: 'Backlog', count: 5, dot: 'bg-white/20', cards: [
                        { title: 'Setup CI/CD pipeline', tag: 'DevOps', priority: 'medium' },
                        { title: 'Design system tokens', tag: 'Design', priority: 'low' },
                      ]},
                      { label: 'In Progress', count: 3, dot: 'bg-brand-500', cards: [
                        { title: 'User auth flow', tag: 'Backend', priority: 'high' },
                        { title: 'Dashboard widgets', tag: 'Frontend', priority: 'medium' },
                      ]},
                      { label: 'In Review', count: 2, dot: 'bg-amber-500', cards: [
                        { title: 'Budget module UI', tag: 'Frontend', priority: 'high' },
                      ]},
                      { label: 'Done', count: 8, dot: 'bg-emerald-500', cards: [
                        { title: 'DB schema migration', tag: 'Backend', priority: 'high' },
                        { title: 'Login & signup pages', tag: 'Frontend', priority: 'high' },
                      ]},
                    ].map((col) => (
                      <div key={col.label}>
                        <div className="mb-2.5 flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${col.dot}`} />
                          <span className="text-[11px] font-medium text-white/40">{col.label}</span>
                          <span className="ml-auto text-[10px] text-white/15">{col.count}</span>
                        </div>
                        <div className="space-y-2">
                          {col.cards.map((card) => (
                            <div key={card.title} className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-3 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]">
                              <p className="text-[11px] leading-snug text-white/60">{card.title}</p>
                              <div className="mt-2.5 flex items-center justify-between">
                                <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] text-white/30">{card.tag}</span>
                                <div className={`h-1.5 w-1.5 rounded-full ${
                                  card.priority === 'high' ? 'bg-red-400' : card.priority === 'medium' ? 'bg-amber-400' : 'bg-white/20'
                                }`} />
                              </div>
          {/* Product Screenshot */}
          <Reveal delay={500}>
            <div className="relative mx-auto max-w-6xl pb-20">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-b from-brand-500/15 via-purple-500/10 to-transparent blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-midnight-800/50 shadow-2xl shadow-black/40 ring-1 ring-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-2 border-b border-white/5 bg-midnight-800/80 px-4 py-3">
                  <div className="flex gap-1.5"><div className="h-3 w-3 rounded-full bg-[#FF5F57]" /><div className="h-3 w-3 rounded-full bg-[#FFBD2E]" /><div className="h-3 w-3 rounded-full bg-[#27CA40]" /></div>
                  <div className="ml-3 flex-1 rounded-lg bg-midnight-700/60 px-4 py-1.5 text-xs text-midnight-300 border border-white/5"><span className="text-midnight-500">https://</span>app.onekof.com/dashboard</div>
                </div>
                <div className="bg-midnight-900 p-0.5">
                  <div className="flex min-h-[420px] sm:min-h-[480px]">
                    <div className="hidden w-52 flex-shrink-0 border-r border-white/5 bg-midnight-800/60 p-4 lg:block">
                      <div className="mb-6 flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 shadow-brand-sm"><span className="text-xs font-black text-white">O</span></div>
                        <div><span className="text-sm font-semibold text-white">Onekof</span><p className="text-[10px] text-brand-400">Professional</p></div>
                      </div>
                      <div className="space-y-0.5">
                        {[{ name: 'Dashboard', active: true, e: '📊' },{ name: 'Projects', active: false, e: '📁' },{ name: 'Issues', active: false, e: '🎯' },{ name: 'Teams', active: false, e: '👥' },{ name: 'Goals', active: false, e: '🏆' },{ name: 'Calendar', active: false, e: '📅' },{ name: 'Budgets', active: false, e: '💰' },{ name: 'Reports', active: false, e: '📈' }].map((item) => (
                          <div key={item.name} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium ${item.active ? 'bg-brand-600/15 text-brand-400' : 'text-midnight-300 hover:bg-white/5'}`}><span className="text-sm">{item.e}</span>{item.name}</div>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 p-4 sm:p-5">
                      <div className="mb-5 flex items-center justify-between">
                        <div><h3 className="text-base font-semibold text-white">Sprint Dashboard</h3><p className="mt-0.5 text-xs text-midnight-300">መጋቢት 2017 E.C. &middot; Sprint 12</p></div>
                        <div className="flex items-center gap-2">
                          <div className="hidden items-center gap-1 rounded-lg bg-white/5 px-2 py-1 sm:flex">
                            {['Board', 'List', 'Timeline'].map((v, i) => (<button key={v} className={`rounded-md px-2.5 py-1 text-[10px] font-medium ${i === 0 ? 'bg-brand-600 text-white' : 'text-midnight-400'}`}>{v}</button>))}
                          </div>
                          <button className="rounded-lg bg-gradient-to-r from-brand-600 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-brand-sm">+ New Issue</button>
                        </div>
                      </div>
                      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                        {[{ label: 'Total Tasks', value: '47', change: '+5', color: 'text-white', bg: 'bg-white/5' },{ label: 'Completed', value: '24', change: '51%', color: 'text-emerald-400', bg: 'bg-emerald-500/5' },{ label: 'In Progress', value: '11', change: '', color: 'text-brand-400', bg: 'bg-brand-500/5' },{ label: 'Due Today', value: '3', change: '', color: 'text-amber-400', bg: 'bg-amber-500/5' }].map((stat) => (
                          <div key={stat.label} className={`rounded-xl ${stat.bg} border border-white/5 p-3`}>
                            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                            <div className="mt-0.5 flex items-center gap-1.5"><span className="text-[10px] text-midnight-400">{stat.label}</span>{stat.change && <span className="text-[10px] font-medium text-emerald-400">{stat.change}</span>}</div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                        {[{ title: 'Backlog', color: 'bg-midnight-400', count: 6, tasks: [{ name: 'Payment gateway integration', tag: 'Backend', tagBg: 'bg-purple-500/15 text-purple-400' },{ name: 'የተጠቃሚ ፕሮፋይል ገጽ', tag: 'Frontend', tagBg: 'bg-brand-500/15 text-brand-400' }] },
                          { title: 'To Do', color: 'bg-amber-500', count: 4, tasks: [{ name: 'Multi-language support', tag: 'i18n', tagBg: 'bg-cyan-500/15 text-cyan-400' }] },
                          { title: 'In Progress', color: 'bg-brand-500', count: 3, tasks: [{ name: 'Calendar component', tag: '67%', tagBg: 'bg-brand-500/15 text-brand-400' }] },
                          { title: 'Done', color: 'bg-emerald-500', count: 8, tasks: [{ name: 'Database schema', tag: 'Complete', tagBg: 'bg-emerald-500/15 text-emerald-400' }] }
                        ].map((col) => (
                          <div key={col.title} className="rounded-xl bg-white/[0.03] border border-white/5 p-2.5">
                            <div className="mb-2 flex items-center gap-2"><div className={`h-2 w-2 rounded-full ${col.color}`} /><span className="text-[11px] font-semibold text-midnight-100">{col.title}</span><span className="ml-auto rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] text-midnight-400">{col.count}</span></div>
                            <div className="space-y-1.5">
                              {col.tasks.map((task) => (
                                <div key={task.name} className="rounded-lg border border-white/5 bg-midnight-800/60 p-2.5 hover:bg-midnight-700/60">
                                  <span className="mb-1.5 block text-[11px] font-medium leading-snug text-midnight-100">{task.name}</span>
                                  <span className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-medium ${task.tagBg}`}>{task.tag}</span>
                                </div>
                              ))}
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
              <div className="absolute -left-4 bottom-32 hidden animate-float rounded-xl border border-brand-200/30 bg-white p-3 shadow-brand-md lg:block">
                <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100"><Check className="h-4 w-4 text-emerald-600" /></div><div><p className="text-xs font-semibold text-midnight-800">Task completed</p><p className="text-[10px] text-midnight-400">Payment integration done</p></div></div>
              </div>
              <div className="absolute -right-4 top-40 hidden animate-float-delayed rounded-xl border border-brand-200/30 bg-white p-3 shadow-brand-md lg:block">
                <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50"><Users className="h-4 w-4 text-brand-600" /></div><div><p className="text-xs font-semibold text-midnight-800">3 members online</p><p className="text-[10px] text-midnight-400">Collaborating in real-time</p></div></div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ TRUSTED BY ═══ */}
      <section className="border-y border-white/[0.06] py-14">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-8 text-center text-[12px] font-medium uppercase tracking-widest text-white/20">Trusted by teams across Ethiopia</p>
          <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-4">
            {[
              'TechEth Solutions', 'Addis Development', 'BuildEth Construction',
              'HabeshaFin', 'EthioCloud', 'NileTech Systems',
            ].map((name) => (
              <span key={name} className="text-[14px] font-medium tracking-wide text-white/[0.1] transition-colors hover:text-white/[0.2]">
                {name}
              </span>
      {/* ═══ MARQUEE LOGO STRIP ═══ */}
      <section className="border-b border-surface-200 bg-surface-50 py-14 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.2em] text-midnight-300">Trusted by teams across Ethiopia</p>
        </div>
        <div className="marquee-fade-left">
          <div className="flex animate-marquee gap-12 sm:gap-16">
            {[...Array(2)].map((_, dupeIdx) => (
              <div key={dupeIdx} className="flex shrink-0 gap-12 sm:gap-16">
                {[{ name: 'Ethio Telecom', abbr: 'ET' },{ name: 'Commercial Bank of Ethiopia', abbr: 'CBE' },{ name: 'Ethiopian Airlines', abbr: 'EA' },{ name: 'Safaricom Ethiopia', abbr: 'SE' },{ name: 'Awash Bank', abbr: 'AB' },{ name: 'BGI Ethiopia', abbr: 'BGI' }].map((co) => (
                  <div key={`${dupeIdx}-${co.abbr}`} className="flex shrink-0 items-center gap-3 text-midnight-200">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-200/80 border border-surface-300/50">
                      <span className="text-sm font-bold text-midnight-300">{co.abbr}</span>
                    </div>
                    <span className="text-sm font-medium text-midnight-300 whitespace-nowrap">{co.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Review Badges */}
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 mt-10">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {[
              { label: 'G2 Leader', rating: '4.8/5', reviews: '200+ reviews' },
              { label: 'Product Hunt', rating: '#1 Product', reviews: 'of the Day' },
              { label: 'Capterra', rating: '4.9/5', reviews: '150+ reviews' },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-3 rounded-xl border border-surface-300 bg-white px-4 py-2.5 shadow-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
                  <Star className="h-4 w-4 fill-brand-500 text-brand-500" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-midnight-800">{badge.label}</span>
                    <span className="text-xs font-semibold text-brand-600">{badge.rating}</span>
                  </div>
                  <span className="text-[10px] text-midnight-300">{badge.reviews}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY ONEKOF ═══ */}
      <section className="py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto mb-20 max-w-3xl text-center">
              <p className="mb-4 text-[13px] font-medium uppercase tracking-widest text-brand-400">Why Onekof</p>
              <h2 className="text-3xl font-semibold tracking-[-0.025em] sm:text-4xl lg:text-[2.75rem]">
                Foreign tools weren&apos;t built for you.
                <br />
                <span className="text-white/35">We are.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-white/30">
                Jira doesn&apos;t know about Pagume. Asana doesn&apos;t speak Amharic.
                Trello can&apos;t track ETB. Onekof does all of this — and more.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: 'Ethiopian Calendar',
                desc: 'Native 13-month calendar with holidays, Amharic month names, and sprint planning.',
                gradient: 'from-brand-500/20 to-purple-500/20',
              },
              {
                icon: Languages,
                title: '4 Languages Built In',
                desc: 'Amharic, Afaan Oromoo, Tigrinya, and English. Human-translated, not machine-generated.',
                gradient: 'from-violet-500/20 to-pink-500/20',
              },
              {
                icon: Wallet,
                title: 'ETB Budget Tracking',
                desc: 'Track every Birr. Create budgets, approve expenses, and generate financial reports.',
                gradient: 'from-emerald-500/20 to-teal-500/20',
              },
              {
                icon: Brain,
                title: 'AI Document Processor',
                desc: 'Upload contracts & proposals. AI extracts deadlines, flags risks, links to tasks.',
                gradient: 'from-amber-500/20 to-orange-500/20',
              },
              {
                icon: Workflow,
                title: 'Custom Workflows',
                desc: 'Automation builder for Ethiopian organizations — government, private, NGO, construction.',
                gradient: 'from-cyan-500/20 to-blue-500/20',
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                desc: 'RBAC, 2FA, audit logs, session management, and SOC 2 ready infrastructure.',
                gradient: 'from-slate-500/20 to-gray-500/20',
              },
            ].map((feature, i) => (
              <Reveal key={feature.title} delay={i * 80}>
                <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 transition-all duration-500 hover:border-white/[0.1] hover:bg-white/[0.04]">
                  <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${feature.gradient} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`} />
                  <div className="relative">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] transition-colors group-hover:border-brand-500/20 group-hover:bg-brand-500/10">
                      <feature.icon className="h-5 w-5 text-white/40 transition-colors group-hover:text-brand-400" />
                    </div>
                    <h3 className="mb-2 text-[15px] font-medium">{feature.title}</h3>
                    <p className="text-[14px] leading-relaxed text-white/30">{feature.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRODUCT SHOWCASE — Interactive Tabs ═══ */}
      <section id="product" className="border-y border-white/[0.06] py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <p className="mb-4 text-[13px] font-medium uppercase tracking-widest text-brand-400">Product</p>
              <h2 className="text-3xl font-semibold tracking-[-0.025em] sm:text-4xl lg:text-[2.75rem]">
                See the real Onekof experience
              </h2>
              <p className="mt-4 text-[16px] text-white/30">
                Not mockups — these are real features powering Ethiopian teams today.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mx-auto max-w-5xl">
              {/* Tab buttons */}
              <div className="mb-8 flex flex-wrap justify-center gap-2">
                {showcaseTabs.map((tab, i) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveShowcase(i)}
                    className={`group flex items-center gap-2 rounded-xl px-5 py-3 text-[13px] font-medium transition-all duration-300 ${
                      activeShowcase === i
                        ? 'bg-white/[0.08] text-white shadow-lg shadow-brand-500/5 ring-1 ring-white/[0.1]'
                        : 'text-white/30 hover:bg-white/[0.04] hover:text-white/50'
                    }`}
                  >
                    <tab.icon className={`h-4 w-4 transition-colors ${activeShowcase === i ? 'text-brand-400' : 'text-white/20'}`} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mx-auto mb-8 flex max-w-md gap-1.5">
                {showcaseTabs.map((_, i) => (
                  <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full bg-brand-500 transition-all ${
                        i === activeShowcase ? 'animate-progress w-full' : i < activeShowcase ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Content */}
              <div className="grid items-start gap-8 lg:grid-cols-2">
                <div className="order-2 lg:order-1">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/[0.06] px-3 py-1">
                    <span className="text-[11px] font-medium text-brand-400">{showcaseTabs[activeShowcase].tagline}</span>
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold tracking-[-0.02em] sm:text-[1.75rem]">
                    {showcaseTabs[activeShowcase].title}
                  </h3>
                  <p className="mb-6 text-[15px] leading-relaxed text-white/35">
                    {showcaseTabs[activeShowcase].desc}
                  </p>
                  <ul className="mb-8 space-y-3">
                    {showcaseTabs[activeShowcase].features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-[14px] text-white/45">
                        <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/10">
                          <Check className="h-3 w-3 text-brand-400" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/signup"
                    className="group inline-flex items-center gap-2 text-[14px] font-medium text-brand-400 transition-colors hover:text-brand-300"
                  >
                    Try it free
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                <div className="order-1 lg:order-2">
                  <div className="rounded-2xl border border-white/[0.08] bg-midnight-900/50 p-5 ring-1 ring-white/[0.04] transition-all">
                    {showcaseMockups[activeShowcase]}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FEATURES GRID ═══ */}
      <section id="features" className="py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-4 text-[13px] font-medium uppercase tracking-widest text-brand-400">Features</p>
              <h2 className="text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
                Everything your team needs.
                <br />
                <span className="text-white/35">Nothing it doesn&apos;t.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Kanban, title: 'Kanban Boards', desc: 'Drag-and-drop task management with custom columns, WIP limits, and swimlanes.' },
              { icon: GanttChart, title: 'Timeline & Gantt', desc: 'Visualize project schedules, dependencies, and critical paths across teams.' },
              { icon: ListChecks, title: 'List & Table Views', desc: 'Spreadsheet-style task management with filters, groups, and bulk actions.' },
              { icon: Target, title: 'Goals & OKRs', desc: 'Set objectives, track key results, and align every project to org goals.' },
              { icon: Workflow, title: 'Automations', desc: 'Build if-then workflows: auto-assign, notify, update statuses on events.' },
              { icon: BarChart3, title: 'Analytics & Reports', desc: 'Velocity, burndown, team performance, and custom dashboards with live data.' },
              { icon: Zap, title: 'Real-time Collaboration', desc: 'Live cursors, instant updates, real-time comments, and push notifications.' },
              { icon: FileText, title: 'Documents & Wiki', desc: 'Rich-text docs, knowledge base, and file management within projects.' },
              { icon: Shield, title: 'Enterprise Security', desc: 'RBAC, 2FA, SSO, session management, audit logs. SOC 2 ready.' },
            ].map((feature, i) => (
              <Reveal key={feature.title} delay={i * 40}>
                <div className="group border border-white/[0.03] bg-midnight-950 p-7 transition-all duration-500 hover:bg-white/[0.025]">
                  <feature.icon className="mb-4 h-5 w-5 text-white/25 transition-colors duration-300 group-hover:text-brand-400" />
                  <h3 className="mb-2 text-[15px] font-medium">{feature.title}</h3>
                  <p className="text-[13px] leading-relaxed text-white/30">{feature.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="border-y border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 divide-x divide-white/[0.06] lg:grid-cols-4">
            {[
              { value: 500, suffix: '+', label: 'Teams onboarded', icon: Building2 },
              { value: 40, suffix: '%', label: 'Faster delivery', icon: TrendingUp },
              { value: 99, suffix: '.9%', label: 'Platform uptime', icon: Timer },
              { value: 4, suffix: '', label: 'Languages supported', icon: Globe },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 100}>
                <div className="group py-14 text-center transition-colors hover:bg-white/[0.02] sm:py-16">
                  <stat.icon className="mx-auto mb-4 h-5 w-5 text-white/15 transition-colors group-hover:text-brand-400/50" />
                  <div className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    <Counter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-2 text-[13px] text-white/25">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="about" className="py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-4 text-[13px] font-medium uppercase tracking-widest text-brand-400">Testimonials</p>
              <h2 className="text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
                Loved by teams who&apos;ve
                <br />
                <span className="text-white/35">tried everything else</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote: "We tried Jira, Trello, and Asana. None understood Ethiopian workflows. Onekof's calendar integration alone saved us hours every week.",
                name: 'Abebe Kebede',
                role: 'CTO, TechEth Solutions',
                gradient: 'from-brand-500 to-purple-600',
              },
              {
                quote: "Finally, a PM tool our entire team can use — including those most comfortable in Amharic. The language support isn't an afterthought, it's core to the product.",
                name: 'Tigist Haile',
                role: 'Project Manager, Addis Development',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                quote: "The budget tracking in ETB with approval workflows eliminated our spreadsheet chaos. Real-time visibility into every project's financial health.",
                name: 'Dawit Tesfaye',
                role: 'Finance Director, BuildEth',
                gradient: 'from-emerald-500 to-teal-500',
              },
              {
                quote: "The AI document processor changed how we handle procurement. It extracts deadlines and flags risks from contracts automatically — saving us days of manual work.",
                name: 'Sara Mengistu',
                role: 'Operations Lead, EthioCloud',
                gradient: 'from-amber-500 to-orange-500',
              },
              {
                quote: "As a government ministry, we needed Ethiopian calendar support and Amharic interface. Onekof is the only tool that treats these as first-class features, not plugins.",
                name: 'Yohannes Bekele',
                role: 'IT Director, Ministry of Innovation',
                gradient: 'from-cyan-500 to-blue-500',
              },
              {
                quote: "We onboarded 200+ team members in a week. The guided onboarding flow made it effortless — everyone was productive from day one, regardless of their language preference.",
                name: 'Hanna Tadesse',
                role: 'HR Director, NileTech Systems',
                gradient: 'from-rose-500 to-pink-500',
              },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 60}>
                <div className="group h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500 hover:border-white/[0.1] hover:bg-white/[0.04]">
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-amber-400/80 text-amber-400/80" />
                    ))}
                  </div>
                  <p className="mb-6 text-[14px] leading-relaxed text-white/40">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${t.gradient} text-[11px] font-bold text-white shadow-sm`}>
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-white/70">{t.name}</p>
                      <p className="text-[12px] text-white/25">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </GlowGrid>
        </div>
      </section>

      {/* ═══ INTEGRATIONS ═══ */}
      <section className="border-y border-surface-200 bg-surface-50 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3.5 py-1.5 border border-brand-100"><Zap className="h-3.5 w-3.5 text-brand-500" /><span className="text-xs font-semibold uppercase tracking-wider text-brand-600">Integrations</span></div>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-midnight-800 sm:text-4xl">Connects to tools you already use</h2>
              <p className="text-lg text-midnight-400">Bring your favorite apps into one unified workspace. Import, sync, and automate across your entire toolchain.</p>
            </div>
          </Reveal>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {integrations.map((int, i) => (
              <Reveal key={int.name} delay={i * 50}>
                <div className="group flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-sm hover:shadow-brand-md">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${int.color} shadow-sm`}><int.icon className="h-5 w-5 text-white" /></div>
                  <span className="text-sm font-semibold text-midnight-700">{int.name}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="border-t border-white/[0.06] py-28 sm:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-4 text-[13px] font-medium uppercase tracking-widest text-brand-400">Pricing</p>
              <h2 className="mb-4 text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
                Simple pricing in Ethiopian Birr
              </h2>
              <p className="text-[16px] text-white/30">
                Start free. Upgrade when you&apos;re ready. Pay in ETB — no forex hassle.
              </p>

              <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
                <button
                  onClick={() => setBilling('monthly')}
                  className={`rounded-full px-5 py-2.5 text-[13px] font-medium transition-all duration-300 ${
                    billing === 'monthly' ? 'bg-white text-midnight-950 shadow-sm' : 'text-white/35 hover:text-white/60'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling('yearly')}
                  className={`rounded-full px-5 py-2.5 text-[13px] font-medium transition-all duration-300 ${
                    billing === 'yearly' ? 'bg-white text-midnight-950 shadow-sm' : 'text-white/35 hover:text-white/60'
                  }`}
                >
                  Yearly
                  {billing !== 'yearly' && <span className="ml-1.5 text-[11px] font-semibold text-emerald-400">Save 20%</span>}
                </button>
              </div>
            </div>
          </Reveal>

          <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-3">
            {plans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 80}>
                <div
                  className={`relative h-full rounded-2xl border p-7 transition-all duration-500 ${
                    plan.highlighted
                      ? 'border-brand-500/30 bg-gradient-to-b from-brand-500/[0.08] to-transparent shadow-brand-md'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-600 to-purple-600 px-3.5 py-1 text-[11px] font-medium shadow-brand-md">
                        <Crown className="h-3 w-3" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="text-[16px] font-medium">{plan.name}</h3>
                    <p className="mt-1 text-[13px] text-white/25">{plan.desc}</p>
                  </div>

                  <div className="mb-6">
                    {plan.price !== null ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-semibold tracking-tight">
                          {(billing === 'yearly' ? plan.yearlyPrice : plan.price)?.toLocaleString()}
                        </span>
                        <span className="text-[13px] text-white/25">ETB/user/mo</span>
                      </div>
                    ) : (
                      <div className="text-4xl font-semibold tracking-tight">Custom</div>
                    )}
                    {plan.price === 0 && (
                      <p className="mt-1.5 text-[12px] text-white/20">Free forever, no card needed</p>
                    )}
                  </div>

                  <Link
                    href={plan.name === 'Enterprise' ? '#contact' : '/auth/signup'}
                    className={`mb-7 block rounded-xl py-3 text-center text-[13px] font-medium transition-all duration-300 ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-brand-md hover:shadow-brand-lg hover:brightness-110'
                        : 'border border-white/[0.1] text-white/50 hover:border-white/[0.2] hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-[13px] text-white/35">
                        <Check className="h-3.5 w-3.5 flex-shrink-0 text-brand-400/50" />
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
      <section className="border-y border-white/[0.06] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h3 className="mb-12 text-center text-2xl font-semibold tracking-[-0.02em]">
              Why teams switch to Onekof
            </h3>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-3">
            {[
              { from: 'Jira', reasons: ['No Ethiopian calendar support', 'English-only interface', 'Overly complex for most teams', 'No ETB budget tracking'] },
              { from: 'Trello', reasons: ['No budget or expense tracking', 'Limited reporting & analytics', 'No workflow automation', 'No document processing'] },
              { from: 'Spreadsheets', reasons: ['No real-time collaboration', 'No task dependencies', 'Manual status tracking', 'No security or audit logs'] },
            ].map((item, i) => (
              <Reveal key={item.from} delay={i * 80}>
                <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500 hover:border-white/[0.1] hover:bg-white/[0.04]">
                  <p className="mb-5 text-[14px] font-medium">
                    Switching from <span className="text-brand-400">{item.from}</span>?
                  </p>
                  <ul className="space-y-2.5">
                    {item.reasons.map((r) => (
                      <li key={r} className="flex items-center gap-2.5 text-[13px] text-white/30">
                        <X className="h-3.5 w-3.5 flex-shrink-0 text-red-400/40" />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 border-t border-white/[0.06] pt-5">
                    <p className="flex items-center gap-2 text-[13px] font-medium text-emerald-400">
                      <Check className="h-4 w-4" />
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
      <section className="relative overflow-hidden py-32 sm:py-40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1),transparent_70%)]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2">
              <Sparkles className="h-3.5 w-3.5 text-brand-400" />
              <span className="text-[13px] text-white/40">Join 500+ Ethiopian teams</span>
            </div>
            <h2 className="text-3xl font-semibold tracking-[-0.025em] sm:text-4xl lg:text-5xl">
              Ready to transform how
              <br />
              your team works?
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-white/30">
              Start for free today. No credit card. No foreign currency.
              Just the tools your team actually needs.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/signup"
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 px-8 py-4 text-[15px] font-medium text-white shadow-brand-lg transition-all hover:shadow-brand-xl hover:brightness-110 active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  Get started — it&apos;s free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              <a
                href="mailto:hello@onekof.com"
                className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.1] px-8 py-4 text-[15px] font-medium text-white/40 transition-all hover:border-white/[0.2] hover:bg-white/[0.04] hover:text-white/70"
              >
                Talk to sales
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 shadow-brand-sm">
                  <span className="text-[12px] font-black text-white">O</span>
                </div>
                <span className="text-[15px] font-semibold">Onekof</span>
              </div>
              <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/25">
                Modern project management built for Ethiopian teams. Native calendar,
                local languages, ETB budgets, and workflows designed for how you actually work.
              </p>
              <div className="mt-6 flex gap-3">
                {[
                  { name: 'Twitter', letter: 'X' },
                  { name: 'LinkedIn', letter: 'in' },
                  { name: 'Telegram', letter: 'T' },
                ].map((social) => (
                  <a
                    key={social.name}
                    href="#"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-[11px] font-bold text-white/25 transition-all hover:border-brand-500/20 hover:bg-brand-500/10 hover:text-brand-400"
                  >
                    {social.letter}
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'Changelog', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Contact'] },
              { title: 'Resources', links: ['Documentation', 'Help Center', 'API Reference', 'Community', 'Status'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/20">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-[13px] text-white/25 transition-colors hover:text-white/50">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
            <p className="text-[12px] text-white/15">
              &copy; {new Date().getFullYear()} Onekof. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Cookies'].map((link) => (
                <a key={link} href="#" className="text-[12px] text-white/15 transition-colors hover:text-white/30">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

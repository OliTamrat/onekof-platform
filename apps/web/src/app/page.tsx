'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence, useInView as fmUseInView, useMotionValue, useSpring } from 'framer-motion';

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
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/contexts/language-context';

/* ─── Hooks ─── */

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Counter({ end, suffix = '', duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = fmUseInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: duration * 1000, bounce: 0 });

  useEffect(() => {
    if (isInView) motionVal.set(end);
  }, [isInView, end, motionVal]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix;
    });
    return unsubscribe;
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ─── Animation Variants ─── */
const heroStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } }
};

const heroChild = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

/* ─── Data (static parts only — translated labels are inside component) ─── */

/* ─── Sub-components for product showcases ─── */
function BudgetMockup({ t }: { t: (key: string) => string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] font-medium text-white/70">{t('landing.mockup.projectBudget')}</h4>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">{t('landing.mockup.onTrack')}</span>
      </div>
      <div className="space-y-3">
        {[
          { key: 'landing.mockup.development', spent: 245000, budget: 400000, pct: 61 },
          { key: 'landing.mockup.designUx', spent: 85000, budget: 120000, pct: 71 },
          { key: 'landing.mockup.infrastructure', spent: 32000, budget: 80000, pct: 40 },
          { key: 'landing.mockup.marketing', spent: 15000, budget: 50000, pct: 30 },
        ].map((item) => (
          <div key={item.key} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-medium text-white/60">{t(item.key)}</span>
              <span className="text-[11px] text-white/50">
                {item.spent.toLocaleString()} / {item.budget.toLocaleString()} ETB
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  item.pct > 70 ? 'bg-amber-500' : 'bg-primary-500'
                }`}
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-lg border border-primary-500/20 bg-primary-500/[0.06] p-3">
        <div>
          <p className="text-[11px] text-white/60">{t('landing.mockup.totalSpent')}</p>
          <p className="text-[16px] font-semibold text-white">377,000 ETB</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-white/60">{t('landing.mockup.remaining')}</p>
          <p className="text-[16px] font-semibold text-emerald-400">273,000 ETB</p>
        </div>
      </div>
    </div>
  );
}

function AIDocsMockup({ t }: { t: (key: string) => string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
          <FileText className="h-5 w-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-medium text-white/70">Procurement_Contract_Q2.pdf</p>
          <p className="text-[11px] text-white/50">{t('landing.mockup.uploadedAgo')}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary-500/10 px-2 py-1">
          <Sparkles className="h-3 w-3 text-primary-400" />
          <span className="text-[10px] font-medium text-primary-400">{t('landing.mockup.processing')}</span>
        </div>
      </div>
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center gap-2">
          <Wand2 className="h-3.5 w-3.5 text-primary-400" />
          <span className="text-[12px] font-medium text-white/60">{t('landing.mockup.aiSummary')}</span>
        </div>
        <p className="text-[12px] leading-relaxed text-white/60">
          {t('landing.mockup.aiSummaryText')}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {[
          { key: 'landing.mockup.deadlines', value: '4', icon: Clock },
          { key: 'landing.mockup.riskFlags', value: '3', icon: Shield },
          { key: 'landing.mockup.tasksLinked', value: '7', icon: ListChecks },
        ].map((item) => (
          <div key={item.key} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-center sm:p-2.5">
            <item.icon className="mx-auto mb-1 h-3.5 w-3.5 text-white/50" />
            <p className="text-[14px] font-semibold text-white/70">{item.value}</p>
            <p className="text-[10px] text-white/50">{t(item.key)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarMockup({ t: _t }: { t: (key: string) => string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-white/70">መጋቢት 2017</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/[0.05]">
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/[0.05]">
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {['ሰ', 'ማ', 'ረ', 'ሐ', 'አ', 'ቅ', 'እ'].map((d) => (
          <div key={d} className="py-2 text-center text-[11px] font-medium text-white/40">{d}</div>
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
                isToday ? 'bg-primary-600 font-semibold text-white shadow-lg' :
                isDeadline ? 'bg-red-500/10 font-medium text-red-400' :
                isHoliday ? 'bg-amber-500/10 font-medium text-amber-400' :
                'text-white/60 hover:bg-white/[0.04]'
              }`}
            >
              {i + 1}
              {hasDot && <div className="absolute bottom-1 h-1 w-1 rounded-full bg-primary-400" />}
            </div>
          );
        })}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 rounded-md bg-primary-500/8 border border-primary-500/10 px-3 py-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
          <span className="text-[11px] text-primary-300">Sprint 14 Review — መጋ 6</span>
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

function LanguageMockup({ t }: { t: (key: string) => string }) {
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
              i === 0 ? 'border-primary-500/20 bg-primary-500/[0.06]' : 'border-white/[0.06] bg-white/[0.02]'
            }`}
          >
            <span className="text-lg">{item.flag}</span>
            <div className="flex-1">
              <p className="text-[12px] font-medium text-white/70">{item.lang}</p>
              <p className="text-[11px] text-white/50">{item.sample}</p>
            </div>
            {i === 0 && (
              <span className="rounded-full bg-primary-500/20 px-2 py-0.5 text-[10px] font-medium text-primary-400">{t('landing.mockup.active')}</span>
            )}
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
        <p className="mb-2 text-[11px] font-medium text-white/60">{t('landing.mockup.uiPreview')}</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 rounded-md bg-white/[0.04] px-3 py-2">
            <LayoutDashboard className="h-3.5 w-3.5 text-white/50" />
            <span className="text-[12px] text-white/50">ዳሽቦርድ</span>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-primary-500/10 px-3 py-2">
            <Kanban className="h-3.5 w-3.5 text-primary-400" />
            <span className="text-[12px] font-medium text-primary-400">ፕሮጀክቶች</span>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-white/[0.04] px-3 py-2">
            <Calendar className="h-3.5 w-3.5 text-white/50" />
            <span className="text-[12px] text-white/50">የኢትዮጵያ ቀን መቁጠሪያ</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function HomePage() {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeShowcase, setActiveShowcase] = useState(0);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [heroTyped, setHeroTyped] = useState('');

  const heroWords = [t('landing.hero.words.shipFaster'), t('landing.hero.words.trackBudgets'), t('landing.hero.words.planSprints'), t('landing.hero.words.collaborate')];
  const [heroWordIndex, setHeroWordIndex] = useState(0);

  const { scrollYProgress } = useScroll();
  const ctaY = useTransform(scrollYProgress, [0.8, 1], [50, 0]);

  const showcaseTabs = [
    {
      id: 'budget',
      label: t('landing.showcase.budget.label'),
      icon: Wallet,
      tagline: t('landing.showcase.budget.tagline'),
      title: t('landing.showcase.budget.title'),
      desc: t('landing.showcase.budget.desc'),
      features: [t('landing.showcase.budget.feature1'), t('landing.showcase.budget.feature2'), t('landing.showcase.budget.feature3'), t('landing.showcase.budget.feature4')],
    },
    {
      id: 'ai-docs',
      label: t('landing.showcase.aiDocs.label'),
      icon: Brain,
      tagline: t('landing.showcase.aiDocs.tagline'),
      title: t('landing.showcase.aiDocs.title'),
      desc: t('landing.showcase.aiDocs.desc'),
      features: [t('landing.showcase.aiDocs.feature1'), t('landing.showcase.aiDocs.feature2'), t('landing.showcase.aiDocs.feature3'), t('landing.showcase.aiDocs.feature4')],
    },
    {
      id: 'calendar',
      label: t('landing.showcase.calendar.label'),
      icon: Calendar,
      tagline: t('landing.showcase.calendar.tagline'),
      title: t('landing.showcase.calendar.title'),
      desc: t('landing.showcase.calendar.desc'),
      features: [t('landing.showcase.calendar.feature1'), t('landing.showcase.calendar.feature2'), t('landing.showcase.calendar.feature3'), t('landing.showcase.calendar.feature4')],
    },
    {
      id: 'language',
      label: t('landing.showcase.language.label'),
      icon: Languages,
      tagline: t('landing.showcase.language.tagline'),
      title: t('landing.showcase.language.title'),
      desc: t('landing.showcase.language.desc'),
      features: [t('landing.showcase.language.feature1'), t('landing.showcase.language.feature2'), t('landing.showcase.language.feature3'), t('landing.showcase.language.feature4')],
    },
  ];

  const plans = [
    {
      name: t('landing.pricing.free.name'),
      desc: t('landing.pricing.free.desc'),
      price: 0,
      yearlyPrice: 0,
      features: [t('landing.pricing.free.feature1'), t('landing.pricing.free.feature2'), t('landing.pricing.free.feature3'), t('landing.pricing.free.feature4'), t('landing.pricing.free.feature5'), t('landing.pricing.free.feature6')],
      cta: t('landing.pricing.free.cta'),
      highlighted: false,
    },
    {
      name: t('landing.pricing.pro.name'),
      desc: t('landing.pricing.pro.desc'),
      price: 2500,
      yearlyPrice: 1999,
      features: [t('landing.pricing.pro.feature1'), t('landing.pricing.pro.feature2'), t('landing.pricing.pro.feature3'), t('landing.pricing.pro.feature4'), t('landing.pricing.pro.feature5'), t('landing.pricing.pro.feature6'), t('landing.pricing.pro.feature7'), t('landing.pricing.pro.feature8'), t('landing.pricing.pro.feature9')],
      cta: t('landing.pricing.pro.cta'),
      highlighted: true,
    },
    {
      name: t('landing.pricing.enterprise.name'),
      desc: t('landing.pricing.enterprise.desc'),
      price: null,
      yearlyPrice: null,
      features: [t('landing.pricing.enterprise.feature1'), t('landing.pricing.enterprise.feature2'), t('landing.pricing.enterprise.feature3'), t('landing.pricing.enterprise.feature4'), t('landing.pricing.enterprise.feature5'), t('landing.pricing.enterprise.feature6'), t('landing.pricing.enterprise.feature7'), t('landing.pricing.enterprise.feature8')],
      cta: t('landing.pricing.enterprise.cta'),
      highlighted: false,
    },
  ];

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
    const timer = setInterval(() => setActiveShowcase((prev) => (prev + 1) % showcaseTabs.length), 8000);
    return () => clearInterval(timer);
  }, []);

  const navLinks = [
    { label: t('landing.nav.features'), href: '#features' },
    { label: t('landing.nav.product'), href: '#product' },
    { label: t('landing.nav.pricing'), href: '#pricing' },
    { label: t('landing.nav.about'), href: '#about' },
  ];

  const showcaseMockups = [<BudgetMockup t={t} />, <AIDocsMockup t={t} />, <CalendarMockup t={t} />, <LanguageMockup t={t} />];

  return (
    <div className="min-h-screen bg-[#1B1F23] font-sans antialiased text-white selection:bg-primary-500/20">
      {/* ═══ NAVBAR ═══ */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b border-white/[0.06] bg-[#1B1F23]/70 backdrop-blur-2xl backdrop-saturate-150'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg transition-shadow group-hover:shadow-xl">
              <span className="text-sm font-black text-white">O</span>
            </div>
            <span className="text-[15px] font-semibold tracking-[-0.01em]">Onekof</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-[13px] text-white/60 transition-all hover:bg-white/[0.04] hover:text-white/80"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher />
            <Link
              href="/auth/signin"
              className="rounded-lg px-3.5 py-2 text-[13px] text-white/60 transition-colors hover:text-white/80"
            >
              {t('common.signIn')}
            </Link>
            <Link
              href="/auth/signup"
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-2 text-[13px] font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:brightness-110"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                {t('common.getStarted')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>

          <Button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden" aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5 text-white/60" />}
          </Button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-white/[0.06] bg-[#1B1F23]/98 backdrop-blur-2xl md:hidden overflow-hidden"
            >
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
                  <Link href="/auth/signin" className="py-2.5 text-[15px] text-white/50">{t('common.signIn')}</Link>
                  <Link href="/auth/signup" className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2.5 text-center text-[15px] font-semibold text-white shadow-lg">
                    {t('common.getStarted')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[800px] w-[1200px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)]" />
          <div className="absolute left-1/4 top-40 h-[400px] w-[400px] rounded-full bg-purple-500/[0.04] blur-[120px]" />
          <div className="absolute right-1/4 top-60 h-[300px] w-[300px] rounded-full bg-primary-500/[0.04] blur-[100px]" />
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
          <motion.div
            initial="hidden"
            animate="visible"
            variants={heroStagger}
          >
            <motion.div variants={heroChild}>
              <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 backdrop-blur-sm transition-all hover:border-white/[0.12] hover:bg-white/[0.05]">
                <div className="relative h-2 w-2">
                  <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
                  <div className="relative h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[13px] text-white/50">{t('landing.hero.badge')}</span>
                <ArrowRight className="h-3 w-3 text-white/50" />
              </div>
            </motion.div>

            <motion.div variants={heroChild}>
              <h1 className="mx-auto max-w-4xl font-display text-[clamp(2rem,6vw,5rem)] font-semibold leading-[1.05] tracking-[-0.04em]">
                {t('landing.hero.headingPrefix')}
                <br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-primary-200 bg-clip-text text-transparent">
                    {heroTyped}
                  </span>
                  <span className="ml-0.5 inline-block h-[0.9em] w-[3px] animate-pulse rounded-full bg-primary-400 align-middle" />
                </span>
              </h1>
            </motion.div>

            <motion.div variants={heroChild}>
              <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-white/55 sm:text-[18px]">
                {t('auth.projectsDescription')}
              </p>
            </motion.div>

            <motion.div variants={heroChild}>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/auth/signup"
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 px-7 py-3.5 text-[14px] font-medium text-white shadow-xl transition-all hover:shadow-2xl hover:brightness-110 active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center gap-2.5">
                    {t('landing.hero.getStartedFree')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
                <a
                  href="#product"
                  className="group inline-flex items-center gap-2.5 rounded-xl border border-white/[0.1] px-7 py-3.5 text-[14px] font-medium text-white/50 backdrop-blur-sm transition-all hover:border-white/[0.2] hover:bg-white/[0.04] hover:text-white/80"
                >
                  <Play className="h-3.5 w-3.5 text-primary-400" />
                  {t('landing.hero.watchDemo')}
                </a>
              </div>
            </motion.div>

            <motion.div variants={heroChild}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
                {[t('landing.hero.freeForever'), t('landing.hero.noCreditCard'), t('landing.hero.setupMinutes')].map((text) => (
                  <span key={text} className="flex items-center gap-1.5 text-[13px] text-white/50">
                    <Check className="h-3.5 w-3.5 text-white/40" />
                    {text}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ─── Dashboard Preview ─── */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative mx-auto max-w-6xl px-6 pb-28">
            <div className="absolute -inset-8 rounded-3xl bg-gradient-to-b from-primary-500/[0.08] via-primary-700/[0.04] to-transparent blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#22272B]/60 shadow-2xl shadow-black/50 ring-1 ring-white/[0.04]">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#22272B]/80 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#27C93F]/80" />
                </div>
                <div className="mx-auto flex h-7 w-48 items-center justify-center rounded-lg bg-white/[0.04] text-[11px] text-white/40 sm:w-72">
                  <Shield className="mr-1.5 h-3 w-3" />
                  app.onekof.com/projects/sprint-14
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="flex min-h-[460px] sm:min-h-[520px]">
                {/* Sidebar */}
                <div className="hidden w-56 border-r border-white/[0.06] bg-[#1B1F23]/60 p-4 lg:block">
                  <div className="mb-6 flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-[10px] font-bold shadow-sm">T</div>
                    <div>
                      <span className="text-[12px] font-medium text-white/70">TechEth</span>
                      <p className="text-[10px] text-white/50">Professional</p>
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
                          ? 'bg-primary-500/10 font-medium text-primary-400'
                          : 'text-white/50 hover:bg-white/[0.03] hover:text-white/50'
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
                      <p className="mt-0.5 text-[11px] text-white/50">መጋቢት 1 – 15, 2017 E.C.</p>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-1.5">
                      {[
                        { label: t('landing.preview.board'), active: true },
                        { label: t('landing.preview.list'), active: false },
                        { label: t('landing.preview.timeline'), active: false },
                        { label: t('landing.preview.calendar'), active: false },
                      ].map((v) => (
                        <div
                          key={v.label}
                          className={`rounded-lg px-2 py-1 text-[10px] transition-colors sm:px-3 sm:py-1.5 sm:text-[11px] ${
                            v.active ? 'bg-white/[0.08] font-medium text-white/70' : 'text-white/40 hover:bg-white/[0.04]'
                          }`}
                        >
                          {v.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                    {[
                      { label: t('landing.preview.totalTasks'), value: '34', color: 'text-white/70' },
                      { label: t('landing.preview.inProgress'), value: '8', color: 'text-primary-400' },
                      { label: t('landing.preview.completed'), value: '18', color: 'text-emerald-400' },
                      { label: t('landing.preview.budgetUsed'), value: '58%', color: 'text-amber-400' },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                        <p className="text-[10px] text-white/50">{s.label}</p>
                        <p className={`text-[16px] font-semibold ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Kanban */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: t('landing.preview.backlog'), count: 5, dot: 'bg-white/20', cards: [
                        { title: 'Setup CI/CD pipeline', tag: 'DevOps', priority: 'medium' },
                        { title: 'Design system tokens', tag: 'Design', priority: 'low' },
                      ]},
                      { label: t('landing.preview.inProgress'), count: 3, dot: 'bg-primary-500', cards: [
                        { title: 'User auth flow', tag: 'Backend', priority: 'high' },
                        { title: 'Dashboard widgets', tag: 'Frontend', priority: 'medium' },
                      ]},
                      { label: t('landing.preview.inReview'), count: 2, dot: 'bg-amber-500', cards: [
                        { title: 'Budget module UI', tag: 'Frontend', priority: 'high' },
                      ]},
                      { label: t('landing.preview.done'), count: 8, dot: 'bg-emerald-500', cards: [
                        { title: 'DB schema migration', tag: 'Backend', priority: 'high' },
                        { title: 'Login & signup pages', tag: 'Frontend', priority: 'high' },
                      ]},
                    ].map((col) => (
                      <div key={col.label}>
                        <div className="mb-2.5 flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${col.dot}`} />
                          <span className="text-[11px] font-medium text-white/60">{col.label}</span>
                          <span className="ml-auto text-[10px] text-white/40">{col.count}</span>
                        </div>
                        <div className="space-y-2">
                          {col.cards.map((card) => (
                            <div key={card.title} className="rounded-lg border border-white/[0.06] bg-white/[0.025] p-3 transition-all hover:border-white/[0.1] hover:bg-white/[0.04]">
                              <p className="text-[11px] leading-snug text-white/60">{card.title}</p>
                              <div className="mt-2.5 flex items-center justify-between">
                                <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] text-white/50">{card.tag}</span>
                                <div className={`h-1.5 w-1.5 rounded-full ${
                                  card.priority === 'high' ? 'bg-red-400' : card.priority === 'medium' ? 'bg-amber-400' : 'bg-white/20'
                                }`} />
                              </div>
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
        </motion.div>
      </section>

      {/* ═══ TRUSTED BY ═══ */}
      <section className="border-y border-white/[0.06] py-14">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-8 text-center text-[12px] font-medium uppercase tracking-widest text-white/40">{t('landing.trustedBy')}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-14">
            {[
              'TechEth Solutions', 'Addis Development', 'BuildEth Construction',
              'HabeshaFin', 'EthioCloud', 'NileTech Systems',
            ].map((name) => (
              <span key={name} className="text-[14px] font-medium tracking-wide text-white/[0.1] transition-colors hover:text-white/[0.2]">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY ONEKOF ═══ */}
      <section className="py-16 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-20">
              <p className="mb-4 text-[13px] font-medium uppercase tracking-widest text-primary-400">{t('landing.whyOnekof.label')}</p>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-[2.75rem]">
                {t('landing.whyOnekof.heading1')}
                <br />
                <span className="text-white/55">{t('landing.whyOnekof.heading2')}</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-white/50">
                {t('landing.whyOnekof.subtitle')}
              </p>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: t('landing.whyOnekof.ethiopianCalendar'),
                desc: t('landing.whyOnekof.ethiopianCalendarDesc'),
                gradient: 'from-primary-500/20 to-primary-700/20',
              },
              {
                icon: Languages,
                title: t('landing.whyOnekof.fourLanguages'),
                desc: t('landing.whyOnekof.fourLanguagesDesc'),
                gradient: 'from-violet-500/20 to-pink-500/20',
              },
              {
                icon: Wallet,
                title: t('landing.whyOnekof.etbBudgetTracking'),
                desc: t('landing.whyOnekof.etbBudgetTrackingDesc'),
                gradient: 'from-emerald-500/20 to-teal-500/20',
              },
              {
                icon: Brain,
                title: t('landing.whyOnekof.aiDocProcessor'),
                desc: t('landing.whyOnekof.aiDocProcessorDesc'),
                gradient: 'from-amber-500/20 to-orange-500/20',
              },
              {
                icon: Workflow,
                title: t('landing.whyOnekof.customWorkflows'),
                desc: t('landing.whyOnekof.customWorkflowsDesc'),
                gradient: 'from-cyan-500/20 to-blue-500/20',
              },
              {
                icon: Shield,
                title: t('landing.whyOnekof.enterpriseSecurity'),
                desc: t('landing.whyOnekof.enterpriseSecurityDesc'),
                gradient: 'from-slate-500/20 to-gray-500/20',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-500 hover:border-white/[0.1] hover:bg-white/[0.04] sm:p-7">
                  <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${feature.gradient} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`} />
                  <div className="relative">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] transition-colors group-hover:border-primary-500/20 group-hover:bg-primary-500/10">
                      <feature.icon className="h-5 w-5 text-white/60 transition-colors group-hover:text-primary-400" />
                    </div>
                    <h3 className="mb-2 text-[15px] font-medium">{feature.title}</h3>
                    <p className="text-[14px] leading-relaxed text-white/50">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRODUCT SHOWCASE — Interactive Tabs ═══ */}
      <section id="product" className="border-y border-white/[0.06] py-16 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <p className="mb-4 text-[13px] font-medium uppercase tracking-widest text-primary-400">{t('landing.showcase.label')}</p>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-[2.75rem]">
                {t('landing.showcase.heading')}
              </h2>
              <p className="mt-4 text-[16px] text-white/50">
                {t('landing.showcase.subtitle')}
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="mx-auto max-w-5xl">
              {/* Tab buttons */}
              <div className="mb-8 flex flex-wrap justify-center gap-2">
                {showcaseTabs.map((tab, i) => (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveShowcase(i)}
                    className={`group flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-medium transition-all duration-300 sm:gap-2 sm:px-5 sm:py-3 sm:text-[13px] ${
                      activeShowcase === i
                        ? 'bg-white/[0.08] text-white shadow-lg shadow-primary-500/5 ring-1 ring-white/[0.1]'
                        : 'text-white/50 hover:bg-white/[0.04] hover:text-white/50'
                    }`}
                  >
                    <tab.icon className={`h-4 w-4 transition-colors ${activeShowcase === i ? 'text-primary-400' : 'text-white/40'}`} />
                    {tab.label}
                  </Button>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mx-auto mb-8 flex max-w-md gap-1.5">
                {showcaseTabs.map((_, i) => (
                  <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full bg-primary-500 transition-all ${
                        i === activeShowcase ? 'animate-progress w-full' : i < activeShowcase ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Content */}
              <div className="grid items-start gap-6 sm:gap-8 lg:grid-cols-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`text-${activeShowcase}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="order-2 lg:order-1"
                  >
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/[0.06] px-3 py-1">
                      <span className="text-[11px] font-medium text-primary-400">{showcaseTabs[activeShowcase].tagline}</span>
                    </div>
                    <h3 className="mb-3 font-display text-2xl font-semibold tracking-[-0.03em] sm:text-[1.75rem]">
                      {showcaseTabs[activeShowcase].title}
                    </h3>
                    <p className="mb-6 text-[15px] leading-relaxed text-white/55">
                      {showcaseTabs[activeShowcase].desc}
                    </p>
                    <ul className="mb-8 space-y-3">
                      {showcaseTabs[activeShowcase].features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-[14px] text-white/45">
                          <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/10">
                            <Check className="h-3 w-3 text-primary-400" />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/auth/signup"
                      className="group inline-flex items-center gap-2 text-[14px] font-medium text-primary-400 transition-colors hover:text-primary-300"
                    >
                      {t('landing.showcase.tryItFree')}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`mockup-${activeShowcase}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="order-1 lg:order-2"
                  >
                    <div className="rounded-2xl border border-white/[0.08] bg-[#22272B]/50 p-5 ring-1 ring-white/[0.04] transition-all">
                      {showcaseMockups[activeShowcase]}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FEATURES GRID ═══ */}
      <section id="features" className="py-16 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-4 text-[13px] font-medium uppercase tracking-widest text-primary-400">{t('landing.features.label')}</p>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                {t('landing.features.heading1')}
                <br />
                <span className="text-white/55">{t('landing.features.heading2')}</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Kanban, title: t('landing.features.kanban'), desc: t('landing.features.kanbanDesc') },
              { icon: GanttChart, title: t('landing.features.timeline'), desc: t('landing.features.timelineDesc') },
              { icon: ListChecks, title: t('landing.features.listTable'), desc: t('landing.features.listTableDesc') },
              { icon: Target, title: t('landing.features.goals'), desc: t('landing.features.goalsDesc') },
              { icon: Workflow, title: t('landing.features.automations'), desc: t('landing.features.automationsDesc') },
              { icon: BarChart3, title: t('landing.features.analytics'), desc: t('landing.features.analyticsDesc') },
              { icon: Zap, title: t('landing.features.realtime'), desc: t('landing.features.realtimeDesc') },
              { icon: FileText, title: t('landing.features.docsWiki'), desc: t('landing.features.docsWikiDesc') },
              { icon: Shield, title: t('landing.features.security'), desc: t('landing.features.securityDesc') },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
                className="group"
              >
                <div className="border border-white/[0.03] bg-[#1B1F23] p-5 transition-all duration-500 hover:bg-white/[0.025] sm:p-7 h-full">
                  <feature.icon className="mb-4 h-5 w-5 text-white/50 transition-colors duration-300 group-hover:text-primary-400" />
                  <h3 className="mb-2 text-[15px] font-medium">{feature.title}</h3>
                  <p className="text-[13px] leading-relaxed text-white/50">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="border-y border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 divide-x divide-white/[0.06] lg:grid-cols-4">
            {[
              { value: 500, suffix: '+', label: t('landing.stats.teamsOnboarded'), icon: Building2 },
              { value: 40, suffix: '%', label: t('landing.stats.fasterDelivery'), icon: TrendingUp },
              { value: 99, suffix: '.9%', label: t('landing.stats.platformUptime'), icon: Timer },
              { value: 4, suffix: '', label: t('landing.stats.languagesSupported'), icon: Globe },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: index * 0.15 }}
              >
                <div className="group py-8 text-center transition-colors hover:bg-white/[0.02] sm:py-14 lg:py-16">
                  <stat.icon className="mx-auto mb-4 h-5 w-5 text-white/40 transition-colors group-hover:text-primary-400/50" />
                  <div className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                    <Counter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-2 text-[13px] text-white/50">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="about" className="py-16 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-16">
              <p className="mb-4 text-[13px] font-medium uppercase tracking-widest text-primary-400">{t('landing.testimonials.label')}</p>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                {t('landing.testimonials.heading1')}
                <br />
                <span className="text-white/55">{t('landing.testimonials.heading2')}</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote: "We tried Jira, Trello, and Asana. None understood Ethiopian workflows. Onekof's calendar integration alone saved us hours every week.",
                name: 'Abebe Kebede',
                role: 'CTO, TechEth Solutions',
                gradient: 'from-primary-500 to-primary-700',
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
            ].map((testimonial, i) => (
              <Reveal key={testimonial.name} delay={i * 60}>
                <motion.div
                  whileHover={{ scale: 1.03, rotate: 0.5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="group h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500 hover:border-white/[0.1] hover:bg-white/[0.04]">
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-amber-400/80 text-amber-400/80" />
                      ))}
                    </div>
                    <p className="mb-6 text-[14px] leading-relaxed text-white/60">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.gradient} text-[11px] font-bold text-white shadow-sm`}>
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-white/70">{testimonial.name}</p>
                        <p className="text-[12px] text-white/50">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="border-t border-white/[0.06] py-16 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-4 text-[13px] font-medium uppercase tracking-widest text-primary-400">{t('landing.pricing.label')}</p>
              <h2 className="mb-4 font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                {t('landing.pricing.heading')}
              </h2>
              <p className="text-[16px] text-white/50">
                {t('landing.pricing.subtitle')}
              </p>

              <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
                <Button
                  onClick={() => setBilling('monthly')}
                  className={`rounded-full px-5 py-2.5 text-[13px] font-medium transition-all duration-300 ${
                    billing === 'monthly' ? 'bg-white text-[#1B1F23] shadow-sm' : 'text-white/55 hover:text-white/60'
                  }`}
                >
                  {t('landing.pricing.monthly')}
                </Button>
                <Button
                  onClick={() => setBilling('yearly')}
                  className={`rounded-full px-5 py-2.5 text-[13px] font-medium transition-all duration-300 ${
                    billing === 'yearly' ? 'bg-white text-[#1B1F23] shadow-sm' : 'text-white/55 hover:text-white/60'
                  }`}
                >
                  {t('landing.pricing.yearly')}
                  {billing !== 'yearly' && <span className="ml-1.5 text-[11px] font-semibold text-emerald-400">{t('landing.pricing.save20')}</span>}
                </Button>
              </div>
            </div>
          </Reveal>

          <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-3">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40, scale: plan.highlighted ? 0.9 : 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={plan.highlighted
                  ? { type: 'spring', stiffness: 200, delay: 0.2 }
                  : { duration: 0.6, delay: i * 0.1 }
                }
                whileHover={{ y: -10 }}
              >
                <div
                  className={`relative h-full rounded-2xl border p-5 transition-all duration-500 sm:p-7 ${
                    plan.highlighted
                      ? 'border-primary-500/30 bg-gradient-to-b from-primary-500/[0.08] to-transparent shadow-xl'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-3.5 py-1 text-[11px] font-medium shadow-xl">
                        <Crown className="h-3 w-3" />
                        {t('landing.pricing.mostPopular')}
                      </div>
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="text-[16px] font-medium">{plan.name}</h3>
                    <p className="mt-1 text-[13px] text-white/50">{plan.desc}</p>
                  </div>

                  <div className="mb-6">
                    {plan.price !== null ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display text-4xl font-semibold tracking-tight">
                          {(billing === 'yearly' ? plan.yearlyPrice : plan.price)?.toLocaleString()}
                        </span>
                        <span className="text-[13px] text-white/50">{t('landing.pricing.etbPerUserMo')}</span>
                      </div>
                    ) : (
                      <div className="font-display text-4xl font-semibold tracking-tight">{t('landing.pricing.custom')}</div>
                    )}
                    {plan.price === 0 && (
                      <p className="mt-1.5 text-[12px] text-white/40">{t('landing.pricing.freeForeverNoCard')}</p>
                    )}
                  </div>

                  <Link
                    href={plan.price === null ? '#contact' : '/auth/signup'}
                    className={`mb-7 block rounded-xl py-3 text-center text-[13px] font-medium transition-all duration-300 ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-xl hover:shadow-xl hover:brightness-110'
                        : 'border border-white/[0.1] text-white/50 hover:border-white/[0.2] hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-[13px] text-white/55">
                        <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary-400/50" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMPARISON ═══ */}
      <section className="border-y border-white/[0.06] py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <h3 className="mb-8 text-center font-display text-xl font-semibold tracking-[-0.03em] sm:mb-12 sm:text-2xl">
              {t('landing.comparison.heading')}
            </h3>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
            {[
              { from: 'Jira', reasons: [t('landing.comparison.jira.reason1'), t('landing.comparison.jira.reason2'), t('landing.comparison.jira.reason3'), t('landing.comparison.jira.reason4')] },
              { from: 'Trello', reasons: [t('landing.comparison.trello.reason1'), t('landing.comparison.trello.reason2'), t('landing.comparison.trello.reason3'), t('landing.comparison.trello.reason4')] },
              { from: t('landing.comparison.spreadsheets.name'), reasons: [t('landing.comparison.spreadsheets.reason1'), t('landing.comparison.spreadsheets.reason2'), t('landing.comparison.spreadsheets.reason3'), t('landing.comparison.spreadsheets.reason4')] },
            ].map((item, i) => (
              <Reveal key={item.from} delay={i * 80}>
                <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500 hover:border-white/[0.1] hover:bg-white/[0.04]">
                  <p className="mb-5 text-[14px] font-medium">
                    {t('landing.comparison.switchingFrom')} <span className="text-primary-400">{item.from}</span>?
                  </p>
                  <ul className="space-y-2.5">
                    {item.reasons.map((r) => (
                      <li key={r} className="flex items-center gap-2.5 text-[13px] text-white/50">
                        <X className="h-3.5 w-3.5 flex-shrink-0 text-red-400/40" />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 border-t border-white/[0.06] pt-5">
                    <p className="flex items-center gap-2 text-[13px] font-medium text-emerald-400">
                      <Check className="h-4 w-4" />
                      {t('landing.comparison.onekofHandlesAll')}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative overflow-hidden py-20 sm:py-32 lg:py-40">
        <motion.div className="pointer-events-none absolute inset-0" style={{ y: ctaY }}>
          <div className="absolute left-1/2 top-1/2 h-[400px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1),transparent_70%)] sm:h-[600px] sm:w-[800px]" />
        </motion.div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2">
              <Sparkles className="h-3.5 w-3.5 text-primary-400" />
              <span className="text-[13px] text-white/60">{t('landing.cta.badge')}</span>
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
              {t('landing.cta.heading1')}
              <br />
              {t('landing.cta.heading2')}
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-white/50">
              {t('landing.cta.subtitle')}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/signup"
                className="group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-3.5 text-[14px] font-medium text-white shadow-xl transition-all hover:shadow-2xl hover:brightness-110 active:scale-[0.98] sm:w-auto sm:px-8 sm:py-4 sm:text-[15px]"
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  {t('landing.cta.getStartedFree')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
              <a
                href="mailto:hello@onekof.com"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] px-6 py-3.5 text-[14px] font-medium text-white/60 transition-all hover:border-white/[0.2] hover:bg-white/[0.04] hover:text-white/70 sm:w-auto sm:px-8 sm:py-4 sm:text-[15px]"
              >
                {t('landing.cta.talkToSales')}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg">
                  <span className="text-[12px] font-black text-white">O</span>
                </div>
                <span className="text-[15px] font-semibold">Onekof</span>
              </div>
              <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/50">
                {t('landing.footer.description')}
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
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-[11px] font-bold text-white/50 transition-all hover:border-primary-500/20 hover:bg-primary-500/10 hover:text-primary-400"
                  >
                    {social.letter}
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: t('landing.footer.productCol'), links: [t('landing.footer.footerLinks.features'), t('landing.footer.footerLinks.pricing'), t('landing.footer.footerLinks.integrations'), t('landing.footer.footerLinks.changelog'), t('landing.footer.footerLinks.roadmap')] },
              { title: t('landing.footer.companyCol'), links: [t('landing.footer.footerLinks.about'), t('landing.footer.footerLinks.blog'), t('landing.footer.footerLinks.careers'), t('landing.footer.footerLinks.press'), t('landing.footer.footerLinks.contact')] },
              { title: t('landing.footer.resourcesCol'), links: [t('landing.footer.footerLinks.documentation'), t('landing.footer.footerLinks.helpCenter'), t('landing.footer.footerLinks.apiReference'), t('landing.footer.footerLinks.community'), t('landing.footer.footerLinks.status')] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-[13px] text-white/50 transition-colors hover:text-white/50">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
            <p className="text-[12px] text-white/40">
              &copy; {new Date().getFullYear()} Onekof. {t('landing.footer.allRightsReserved')}
            </p>
            <div className="flex gap-6">
              {[t('landing.footer.privacy'), t('landing.footer.terms'), t('landing.footer.cookies')].map((link) => (
                <a key={link} href="#" className="text-[12px] text-white/40 transition-colors hover:text-white/50">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

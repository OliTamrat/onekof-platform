'use client';

import { useState, useEffect, useRef , type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence, useInView as fmUseInView, useMotionValue, useSpring } from 'framer-motion';

import {
  ArrowRight,
  Calendar,
  Globe,
  Zap,
  Users,
  Shield,
  ShieldCheck,
  BarChart3,
  Kanban,
  Menu,
  X,
  Target,
  Workflow,
  Languages,
  Pause,
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
  BadgeCheck,
  Smartphone,
  Landmark,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/contexts/language-context';

/* ─── Hooks ─── */

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
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

/* ─── Demo Videos ─── */
const demoVideos = [
  { src: '/videos/demo-budget.mp4', poster: '/videos/demo-budget-poster.jpg', label: 'Budget' },
  { src: '/videos/demo-1.mp4', poster: '/videos/demo-1-poster.jpg', label: 'Product Tour' },
  { src: '/videos/demo-2.mp4', poster: '/videos/demo-2-poster.jpg', label: 'Feature Walkthrough' },
  { src: '/videos/demo-3.mp4', poster: '/videos/demo-3-poster.jpg', label: 'Quick Demo' },
  { src: '/videos/demo-4.mp4', poster: '/videos/demo-4-poster.jpg', label: 'Watch Demo' },
];

/* ─── Video Modal ─── */
function VideoModal({ isOpen, onClose, startIndex = 0 }: { isOpen: boolean; onClose: () => void; startIndex?: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modalVideoIdx, setModalVideoIdx] = useState(startIndex);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setModalVideoIdx(startIndex);
    } else {
      document.body.style.overflow = '';
      videoRef.current?.pause();
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, startIndex]);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [modalVideoIdx, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative mx-4 w-full max-w-4xl overflow-hidden rounded-2xl border border-white/[0.15] bg-[#0B0E11] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3">
              <div className="flex items-center gap-3">
                {demoVideos.map((v, i) => (
                  <button
                    key={v.src}
                    onClick={() => setModalVideoIdx(i)}
                    className={`rounded-full px-3 py-1 text-[13px] font-medium transition-all ${i === modalVideoIdx ? 'bg-primary-500/15 text-[#2BB5A2]' : 'text-white/60 hover:text-white/70'}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative aspect-video w-full bg-[#12161B]">
              <video
                ref={videoRef}
                className="h-full w-full object-contain"
                controls
                playsInline
                autoPlay
                preload="metadata"
              >
                <source src={demoVideos[modalVideoIdx].src} type="video/mp4" />
              </video>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
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

/* ─── Sub-components for product showcases ─── */
function BudgetMockup({ t }: { t: (key: string) => string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[14px] font-medium text-white/70">{t('landing.mockup.projectBudget')}</h4>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">{t('landing.mockup.onTrack')}</span>
      </div>
      <div className="space-y-3">
        {[
          { key: 'landing.mockup.development', spent: 245000, budget: 400000, pct: 61 },
          { key: 'landing.mockup.designUx', spent: 85000, budget: 120000, pct: 71 },
          { key: 'landing.mockup.infrastructure', spent: 32000, budget: 80000, pct: 40 },
          { key: 'landing.mockup.marketing', spent: 15000, budget: 50000, pct: 30 },
        ].map((item) => (
          <div key={item.key} className="rounded-lg border border-white/[0.12] bg-white/[0.02] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-medium text-white">{t(item.key)}</span>
              <span className="text-[11px] text-white/70">
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
          <p className="text-[11px] text-white">{t('landing.mockup.totalSpent')}</p>
          <p className="text-[17px] font-semibold text-white">377,000 ETB</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-white">{t('landing.mockup.remaining')}</p>
          <p className="text-[17px] font-semibold text-emerald-400">273,000 ETB</p>
        </div>
      </div>
    </div>
  );
}

function AIDocsMockup({ t }: { t: (key: string) => string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border border-white/[0.12] bg-white/[0.02] p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
          <FileText className="h-5 w-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-medium text-white/70">Procurement_Contract_Q2.pdf</p>
          <p className="text-[11px] text-white/70">{t('landing.mockup.uploadedAgo')}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary-500/10 px-2 py-1">
          <Sparkles className="h-3 w-3 text-primary-400" />
          <span className="text-[10px] font-medium text-primary-400">{t('landing.mockup.processing')}</span>
        </div>
      </div>
      <div className="rounded-lg border border-white/[0.12] bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center gap-2">
          <Wand2 className="h-3.5 w-3.5 text-primary-400" />
          <span className="text-[13px] font-medium text-white">{t('landing.mockup.aiSummary')}</span>
        </div>
        <p className="text-[13px] leading-relaxed text-white">
          {t('landing.mockup.aiSummaryText')}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {[
          { key: 'landing.mockup.deadlines', value: '4', icon: Clock },
          { key: 'landing.mockup.riskFlags', value: '3', icon: Shield },
          { key: 'landing.mockup.tasksLinked', value: '7', icon: ListChecks },
        ].map((item) => (
          <div key={item.key} className="rounded-lg border border-white/[0.12] bg-white/[0.02] p-2 text-center sm:p-2.5">
            <item.icon className="mx-auto mb-1 h-3.5 w-3.5 text-white/70" />
            <p className="text-[14px] font-semibold text-white/70">{item.value}</p>
            <p className="text-[10px] text-white/70">{t(item.key)}</p>
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
        <span className="text-[14px] font-medium text-white/70">&#4632;&#4875;&#4706;&#4725; 2017</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/[0.05]">
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/[0.05]">
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {['\u1230', '\u121B', '\u1228', '\u1210', '\u12A0', '\u1245', '\u12A5'].map((d) => (
          <div key={d} className="py-2 text-center text-[11px] font-medium text-white/70">{d}</div>
        ))}
        {Array.from({ length: 30 }, (_, i) => {
          const isToday = i === 5;
          const isDeadline = i === 14;
          const isHoliday = i === 22;
          const hasDot = i === 8 || i === 19;
          return (
            <div
              key={i}
              className={`relative flex h-8 items-center justify-center rounded-md text-[13px] transition-all ${
                isToday ? 'bg-primary-600 font-semibold text-white shadow-lg' :
                isDeadline ? 'bg-red-500/10 font-medium text-red-400' :
                isHoliday ? 'bg-amber-500/10 font-medium text-amber-400' :
                'text-white hover:bg-white/[0.04]'
              }`}
            >
              {i + 1}
              {hasDot && <div className="absolute bottom-1 h-1 w-1 rounded-full bg-primary-400" />}
            </div>
          );
        })}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 rounded-md border border-primary-500/10 bg-primary-500/[0.08] px-3 py-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
          <span className="text-[11px] text-primary-300">{_t('landing.mockup.calendarEvent1')}</span>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-red-500/10 bg-red-500/[0.08] px-3 py-2">
          <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
          <span className="text-[11px] text-red-300">{_t('landing.mockup.calendarEvent2')}</span>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-amber-500/10 bg-amber-500/[0.08] px-3 py-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="text-[11px] text-amber-300">{_t('landing.mockup.calendarEvent3')}</span>
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
          { lang: '\u12A0\u121B\u122D\u129B', flag: '\u{1F1EA}\u{1F1F9}', sample: '\u1355\u122E\u1300\u12AD\u1275 \u12A0\u1235\u1270\u12F3\u12F0\u122D', sublabel: 'Project Management' },
          { lang: 'English', flag: '\u{1F1EC}\u{1F1E7}', sample: 'Create New Task', sublabel: 'Create New Task' },
          { lang: 'Afaan Oromoo', flag: '\u{1F1EA}\u{1F1F9}', sample: 'Hojii Haaraa Uumi', sublabel: 'Create New Task' },
          { lang: '\u1275\u130D\u122D\u129B', flag: '\u{1F1EA}\u{1F1F7}', sample: '\u1213\u12F5\u1235 \u12D5\u121B\u121D \u134D\u1325\u122D', sublabel: 'Create New Task' },
        ].map((item, i) => (
          <div
            key={item.lang}
            className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
              i === 0 ? 'border-primary-500/20 bg-primary-500/[0.06]' : 'border-white/[0.12] bg-white/[0.02]'
            }`}
          >
            <span className="text-lg">{item.flag}</span>
            <div className="flex-1">
              <p className="text-[13px] font-medium text-white/70">{item.lang}</p>
              <p className="text-[11px] text-white/70">{item.sample}</p>
            </div>
            {i === 0 && (
              <span className="rounded-full bg-primary-500/20 px-2 py-0.5 text-[10px] font-medium text-primary-400">{t('landing.mockup.active')}</span>
            )}
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-white/[0.12] bg-white/[0.02] p-3">
        <p className="mb-2 text-[11px] font-medium text-white">{t('landing.mockup.uiPreview')}</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 rounded-md bg-white/[0.04] px-3 py-2">
            <LayoutDashboard className="h-3.5 w-3.5 text-white/70" />
            <span className="text-[13px] text-white/70">{'\u12F3\u123D\u1266\u122D\u12F5'}</span>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-primary-500/10 px-3 py-2">
            <Kanban className="h-3.5 w-3.5 text-primary-400" />
            <span className="text-[13px] font-medium text-primary-400">{'\u1355\u122E\u1300\u12AD\u1276\u127D'}</span>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-white/[0.04] px-3 py-2">
            <Calendar className="h-3.5 w-3.5 text-white/70" />
            <span className="text-[13px] text-white/70">{'\u12E8\u12A2\u1275\u12EE\u1335\u12EB \u1240\u1295 \u1218\u1281\u1320\u122A\u12EB'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Grain Overlay ─── */
function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

/* ─── Section Divider ─── */
function SectionDivider() {
  return <div className="mx-auto h-px max-w-6xl bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />;
}

/* ─── MAIN PAGE ─── */
export default function HomePage() {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeShowcase, setActiveShowcase] = useState(0);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [heroTyped, setHeroTyped] = useState('');
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoStartIdx, setVideoStartIdx] = useState(0);
  const [heroIdx, setHeroIdx] = useState(0);
  const [showcaseIdx, setShowcaseIdx] = useState(0);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const showcaseVideoRef = useRef<HTMLVideoElement>(null);

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

  // Hero video: update src via ref when heroIdx changes (no remount = no reload glitch)
  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v) return;
    v.src = demoVideos[heroIdx].src;
    v.load();
    v.play().catch(() => {});
  }, [heroIdx]);

  // Showcase video: same ref-based swap
  useEffect(() => {
    const v = showcaseVideoRef.current;
    if (!v) return;
    v.src = demoVideos[showcaseIdx].src;
    v.load();
    v.play().catch(() => {});
  }, [showcaseIdx]);

  // Auto-rotate hero every 10s (longer = less disruptive, gives time for full keyframe cycle)
  useEffect(() => {
    const timer = setInterval(() => setHeroIdx((prev) => (prev + 1) % demoVideos.length), 10000);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate showcase every 10s
  useEffect(() => {
    const timer = setInterval(() => setShowcaseIdx((prev) => (prev + 1) % demoVideos.length), 10000);
    return () => clearInterval(timer);
  }, []);

  const navLinks = [
    { label: t('landing.nav.features'), href: '#features' },
    { label: t('landing.nav.product'), href: '#product' },
    { label: t('landing.nav.pricing'), href: '#pricing' },
    { label: t('landing.nav.about'), href: '/about' },
  ];

  const showcaseMockups = [<BudgetMockup t={t} />, <AIDocsMockup t={t} />, <CalendarMockup t={t} />, <LanguageMockup t={t} />];

  return (
    <div className="min-h-screen bg-[#0B0E11] font-sans antialiased text-white selection:bg-primary-500/20">
      <GrainOverlay />
      <VideoModal isOpen={videoOpen} onClose={() => setVideoOpen(false)} startIndex={videoStartIdx} />

      {/* ═══ NAVBAR ═══ */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b border-white/[0.08] bg-[#0B0E11]/80 backdrop-blur-2xl backdrop-saturate-150'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-[64px] max-w-[1200px] items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-primary-500 to-violet-600 shadow-lg transition-shadow group-hover:shadow-xl">
              <span className="text-sm font-black text-white">O</span>
            </div>
            <span className="text-[17px] font-bold tracking-[-0.01em]">Onekof</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-4 py-2 text-[14px] font-medium text-white/70 tracking-[0.02em] transition-all hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher />
            <Link
              href="/auth/signin"
              className="rounded-full border border-white/[0.08] px-4 py-2 text-[14px] font-medium text-white/70 transition-all hover:border-white/[0.2] hover:text-white"
            >
              {t('common.signIn')}
            </Link>
            <Link
              href="/auth/signup"
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-primary-500 to-primary-400 px-5 py-2 text-[14px] font-semibold text-white shadow-lg shadow-primary-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/30 hover:brightness-110"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                {t('common.getStarted')}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>

          <Button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden" aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5 text-white" />}
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
              className="overflow-hidden border-t border-white/[0.08] bg-[#0B0E11]/98 backdrop-blur-2xl md:hidden"
            >
              <div className="space-y-1 px-6 py-4">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg py-2.5 text-[15px] text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-4 flex flex-col gap-2 border-t border-white/[0.08] pt-4">
                  <Link href="/auth/signin" className="py-2.5 text-[15px] text-white/70">{t('common.signIn')}</Link>
                  <Link href="/auth/signup" className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 px-4 py-2.5 text-center text-[15px] font-semibold text-white shadow-lg">
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
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-[15%] -top-[20%] h-[700px] w-[700px] rounded-full bg-primary-500/[0.08] blur-[120px]" />
          <div className="absolute -left-[10%] bottom-[10%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.05] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-6 pb-8 pt-32 sm:pt-40 lg:pt-44">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* LEFT — Text content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={heroStagger}
            >
              <motion.div variants={heroChild}>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-1.5 sm:gap-2.5 sm:px-4 sm:py-2">
                  <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
                  <span className="text-[12px] sm:text-[14px] font-semibold text-emerald-400">INSA Certified</span>
                  <span className="hidden sm:inline-block h-3 w-px bg-white/10" />
                  <span className="hidden sm:inline text-[14px] text-white/70">Ethiopia&apos;s First Certified PM Platform</span>
                </div>
              </motion.div>

              <motion.div variants={heroChild}>
                <h1 className="font-serif text-[clamp(2.5rem,5vw,4.25rem)] font-medium leading-[1.08] tracking-[-0.02em]">
                  {t('landing.hero.headingPrefix')}
                  <br />
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-[#2BB5A2] to-primary-500 bg-clip-text font-serif italic text-transparent">
                      {heroTyped}
                    </span>
                    <span className="ml-0.5 inline-block h-[0.9em] w-[3px] animate-pulse rounded-full bg-primary-400 align-middle" />
                  </span>
                </h1>
              </motion.div>

              <motion.div variants={heroChild}>
                <p className="mt-6 max-w-[480px] text-[18px] leading-[1.75] text-white/65">
                  {t('auth.projectsDescription')}
                </p>
              </motion.div>

              <motion.div variants={heroChild}>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/auth/signup"
                    className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-primary-500 to-[#2BB5A2] px-7 py-3.5 text-[14px] font-semibold text-white shadow-xl shadow-primary-500/20 transition-all hover:shadow-2xl hover:shadow-primary-500/30 hover:brightness-110 active:scale-[0.98]"
                  >
                    {t('landing.hero.getStartedFree')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <button
                    onClick={() => setVideoOpen(true)}
                    className="group inline-flex items-center gap-2.5 rounded-full border border-white/[0.1] px-7 py-3.5 text-[14px] font-medium text-white/70 transition-all hover:border-white/[0.2] hover:text-white"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary-500/30 bg-primary-500/10 transition-colors group-hover:bg-primary-500/20">
                      <Play className="h-3 w-3 text-primary-400" />
                    </div>
                    {t('landing.hero.watchDemo')}
                  </button>
                </div>
              </motion.div>

              <motion.div variants={heroChild}>
                <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[13px] sm:text-[14px] text-white/55">
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    INSA Certified
                  </span>
                  <span className="hidden h-3.5 w-px bg-white/[0.12] sm:inline-block" />
                  <span className="inline-flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary-400" />
                    Pay in ETB
                  </span>
                  <span className="hidden h-3.5 w-px bg-white/[0.12] sm:inline-block" />
                  <span className="inline-flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-primary-400" />
                    7-day free trial
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT — Hero Video Showcase */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:block"
            >
              {/* Glow behind video */}
              <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/[0.06] blur-[100px]" />

              <div className="relative">
                {/* Main hero video — ref-based src swap (no remount) */}
                <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#12161B] shadow-2xl"
                  style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 80px rgba(28,140,125,0.06)' }}
                >
                  <video
                    ref={heroVideoRef}
                    src={demoVideos[heroIdx].src}
                    poster={demoVideos[heroIdx].poster}
                    className="aspect-video w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    disablePictureInPicture
                  />
                </div>

                {/* Video controls bar */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setHeroIdx((prev) => (prev - 1 + demoVideos.length) % demoVideos.length)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] bg-[#12161B] text-white/70 transition-all hover:border-primary-500/30 hover:text-white"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setHeroIdx((prev) => (prev + 1) % demoVideos.length)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] bg-[#12161B] text-white/70 transition-all hover:border-primary-500/30 hover:text-white"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Dot indicators + label */}
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-medium text-white/70">{demoVideos[heroIdx].label}</span>
                    <div className="flex gap-1.5">
                      {demoVideos.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setHeroIdx(i)}
                          className={`h-1.5 rounded-full transition-all ${i === heroIdx ? 'w-5 bg-[#2BB5A2]' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Watch with sound */}
                  <button
                    onClick={() => { setVideoStartIdx(heroIdx); setVideoOpen(true); }}
                    className="flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#12161B] px-3 py-1.5 text-[11px] font-medium text-white/70 transition-all hover:border-primary-500/30 hover:text-white"
                  >
                    <Play className="h-3 w-3" />
                    Sound
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ─── Video Showcase — Full-width Demo Carousel ─── */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative mx-auto max-w-[1200px] px-6 pb-28">
            <div className="absolute -inset-8 rounded-3xl bg-gradient-to-b from-primary-500/[0.06] via-primary-700/[0.03] to-transparent blur-3xl" />

            {/* Video controls — arrows + dots + label */}
            <div className="relative mb-5 flex items-center justify-center gap-4">
              <button
                onClick={() => setShowcaseIdx((prev) => (prev - 1 + demoVideos.length) % demoVideos.length)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-[#12161B] text-white/70 transition-all hover:border-primary-500/30 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {demoVideos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setShowcaseIdx(i)}
                      className={`h-2 rounded-full transition-all ${i === showcaseIdx ? 'w-6 bg-[#2BB5A2]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                    />
                  ))}
                </div>
                <span className="text-[14px] font-medium text-white/70">{demoVideos[showcaseIdx].label}</span>
              </div>

              <button
                onClick={() => setShowcaseIdx((prev) => (prev + 1) % demoVideos.length)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-[#12161B] text-white/70 transition-all hover:border-primary-500/30 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Main showcase video — ref-based src swap (no remount) */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl"
              style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 100px rgba(28,140,125,0.08)' }}
            >
              <video
                ref={showcaseVideoRef}
                src={demoVideos[showcaseIdx].src}
                poster={demoVideos[showcaseIdx].poster}
                className="aspect-video w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                disablePictureInPicture
              />
              {/* Play full button overlay */}
              <button
                onClick={() => { setVideoStartIdx(showcaseIdx); setVideoOpen(true); }}
                className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-[14px] font-medium text-white backdrop-blur-sm transition-all hover:bg-black/80 hover:text-white"
              >
                <Play className="h-3.5 w-3.5" />
                Watch with sound
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ TRUST STRIP — INSA + Built for Ethiopia ═══ */}
      <section className="border-y border-white/[0.06] py-12 sm:py-14">
        <div className="mx-auto max-w-[1200px] px-6">
          <Reveal>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
              {[
                { icon: ShieldCheck, color: 'emerald', title: 'INSA Certified', desc: 'National cybersecurity standard' },
                { icon: Calendar, color: 'primary', title: 'Built for Ethiopia', desc: 'Ethiopian calendar, Amharic, Oromo' },
                { icon: Wallet, color: 'primary', title: 'Pay in Ethiopian Birr', desc: 'Telebirr, CBE Birr, Awash, Card' },
                { icon: Shield, color: 'violet', title: 'Data Residency', desc: 'On-premise deployment available' },
              ].map((item) => {
                const borderColor = item.color === 'emerald' ? 'border-emerald-500/20' : item.color === 'violet' ? 'border-violet-500/20' : 'border-primary-500/20';
                const bgColor = item.color === 'emerald' ? 'bg-emerald-500/[0.08]' : item.color === 'violet' ? 'bg-violet-500/[0.08]' : 'bg-primary-500/[0.08]';
                const iconColor = item.color === 'emerald' ? 'text-emerald-400' : item.color === 'violet' ? 'text-violet-400' : 'text-primary-400';
                return (
                  <div key={item.title} className="flex items-start gap-3.5">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${borderColor} ${bgColor}`}>
                      <item.icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <div>
                      <div className="text-[15px] font-semibold text-white">{item.title}</div>
                      <div className="mt-0.5 text-[14px] leading-snug text-white/70">{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ WHY ONEKOF ═══ */}
      <section className="py-16 sm:py-20 lg:py-24" id="features">
        <div className="mx-auto max-w-[1200px] px-6">
          <Reveal>
            <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-14">
              <div className="mb-5 inline-flex items-center gap-2">
                <span className="h-px w-6 bg-primary-500" />
                <span className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[#2BB5A2]">{t('landing.whyOnekof.label')}</span>
              </div>
              <h2 className="font-serif text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.15] tracking-[-0.01em]">
                {t('landing.whyOnekof.heading1')}{' '}
                <span className="font-serif italic text-[#2BB5A2]">{t('landing.whyOnekof.heading2')}</span>
              </h2>
              <p className="mx-auto mt-5 max-w-[560px] text-[18px] leading-[1.7] text-white/70">
                {t('landing.whyOnekof.subtitle')}
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: t('landing.whyOnekof.ethiopianCalendar'),
                desc: t('landing.whyOnekof.ethiopianCalendarDesc'),
                iconBg: 'bg-primary-500/10 border-primary-500/15',
              },
              {
                icon: Languages,
                title: t('landing.whyOnekof.fourLanguages'),
                desc: t('landing.whyOnekof.fourLanguagesDesc'),
                iconBg: 'bg-violet-500/10 border-violet-500/15',
              },
              {
                icon: Wallet,
                title: t('landing.whyOnekof.etbBudgetTracking'),
                desc: t('landing.whyOnekof.etbBudgetTrackingDesc'),
                iconBg: 'bg-amber-500/10 border-amber-500/15',
              },
              {
                icon: Brain,
                title: t('landing.whyOnekof.aiDocProcessor'),
                desc: t('landing.whyOnekof.aiDocProcessorDesc'),
                iconBg: 'bg-violet-500/10 border-violet-500/15',
              },
              {
                icon: Workflow,
                title: t('landing.whyOnekof.customWorkflows'),
                desc: t('landing.whyOnekof.customWorkflowsDesc'),
                iconBg: 'bg-primary-500/10 border-primary-500/15',
              },
              {
                icon: Shield,
                title: t('landing.whyOnekof.enterpriseSecurity'),
                desc: t('landing.whyOnekof.enterpriseSecurityDesc'),
                iconBg: 'bg-amber-500/10 border-amber-500/15',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.6 }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
              >
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12161B] p-8 transition-all duration-400 hover:border-primary-500/20 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]"
                  style={{ transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)' }}
                >
                  {/* Top glow line */}
                  <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(28,140,125,0.25)] to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
                  <div className="relative">
                    <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl border ${feature.iconBg}`}>
                      <feature.icon className="h-5 w-5 text-white transition-colors group-hover:text-primary-400" />
                    </div>
                    <h3 className="mb-2.5 text-[20px] font-semibold leading-[1.35]">{feature.title}</h3>
                    <p className="text-[14px] leading-[1.6] text-white/70">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══ ANALYTICS HIGHLIGHT ═══ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-gradient-to-br from-[#12161B] to-[#181D23] p-8 sm:p-12 lg:p-14">
              <div className="absolute -right-[20%] -top-[50%] h-[400px] w-[400px] rounded-full bg-primary-500/[0.06] blur-[80px]" />
              <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
                <div>
                  <div className="mb-5 inline-flex items-center gap-2">
                    <span className="h-px w-6 bg-primary-500" />
                    <span className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[#2BB5A2]">Analytics</span>
                  </div>
                  <h2 className="mb-4 font-serif text-[clamp(2rem,3.5vw,2.75rem)] font-medium leading-[1.15]">
                    See the full picture, <span className="font-serif italic text-[#2BB5A2]">instantly</span>
                  </h2>
                  <p className="mb-6 max-w-md text-[15px] leading-[1.65] text-white/70">
                    Real-time dashboards that show team velocity, budget burn rate, sprint health, and
                    project progress — all from data your team is already creating.
                  </p>
                  <Link
                    href="/auth/signup"
                    className="group inline-flex items-center gap-2 rounded-full border border-white/[0.1] px-5 py-2.5 text-[14px] font-medium text-white/70 transition-all hover:border-primary-500/30 hover:text-white"
                  >
                    Explore analytics
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/[0.08] shadow-xl">
                  <Image
                    src="/images/board-laptop.png"
                    alt="Onekof kanban board with issue detail slideout panel"
                    width={1200}
                    height={750}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SectionDivider />

      {/* ═══ PRODUCT SHOWCASE — Interactive Tabs ═══ */}
      <section id="product" className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <Reveal>
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2">
                <span className="h-px w-6 bg-primary-500" />
                <span className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[#2BB5A2]">{t('landing.showcase.label')}</span>
              </div>
              <h2 className="font-serif text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.15] tracking-[-0.01em]">
                {t('landing.showcase.heading')}
              </h2>
              <p className="mx-auto mt-4 max-w-[560px] text-[18px] leading-[1.7] text-white/70">
                {t('landing.showcase.subtitle')}
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="mx-auto max-w-5xl">
              {/* Tab pills */}
              <div className="mb-8 flex flex-wrap justify-center gap-2">
                {showcaseTabs.map((tab, i) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveShowcase(i)}
                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-all duration-300 ${
                      activeShowcase === i
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                        : 'border border-white/[0.08] text-white/70 hover:border-white/[0.15] hover:text-white'
                    }`}
                  >
                    <tab.icon className={`h-4 w-4 ${activeShowcase === i ? 'text-white' : 'text-white/70'}`} />
                    {tab.label}
                  </button>
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
              <div className="grid items-center gap-8 rounded-2xl border border-white/[0.08] bg-[#12161B] p-8 sm:p-12 lg:grid-cols-2">
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
                    <h3 className="mb-3 font-serif text-2xl font-medium tracking-[-0.01em] sm:text-[1.75rem]">
                      {showcaseTabs[activeShowcase].title}
                    </h3>
                    <p className="mb-6 text-[15px] leading-[1.65] text-white/70">
                      {showcaseTabs[activeShowcase].desc}
                    </p>
                    <ul className="mb-8 space-y-4">
                      {showcaseTabs[activeShowcase].features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-[15px] text-white/70">
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
                    <div className="rounded-xl border border-white/[0.08] bg-[#0B0E11] p-6 transition-all">
                      {showcaseMockups[activeShowcase]}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SectionDivider />

      {/* ═══ FEATURES GRID ═══ */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <Reveal>
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <div className="mb-5 inline-flex items-center gap-2">
                <span className="h-px w-6 bg-primary-500" />
                <span className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[#2BB5A2]">{t('landing.features.label')}</span>
              </div>
              <h2 className="font-serif text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.15]">
                {t('landing.features.heading1')}{' '}
                <span className="font-serif italic text-white/70">{t('landing.features.heading2')}</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] sm:grid-cols-2 lg:grid-cols-3">
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
                transition={{ delay: index * 0.06, duration: 0.5 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group"
              >
                <div className="h-full border border-white/[0.03] bg-[#0B0E11] p-6 transition-all duration-500 hover:bg-white/[0.02] sm:p-7">
                  <feature.icon className="mb-4 h-5 w-5 text-white/70 transition-colors duration-300 group-hover:text-primary-400" />
                  <h3 className="mb-2 text-[15px] font-semibold text-white">{feature.title}</h3>
                  <p className="text-[14px] leading-relaxed text-white/70">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { value: 70, suffix: '+', label: 'Database Models' },
              { value: 49, suffix: '', label: 'INSA Security Tests Passed' },
              { value: 99, suffix: '.9%', label: t('landing.stats.platformUptime') },
              { value: 4, suffix: '', label: t('landing.stats.languagesSupported') },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="rounded-2xl border border-white/[0.08] bg-[#12161B] px-6 py-10 text-center">
                  <div className="font-serif text-[clamp(2rem,3vw,2.75rem)] font-semibold text-[#2BB5A2]">
                    <Counter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-1.5 text-[14px] text-white/70">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="about" className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <Reveal>
            <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
              <div className="mb-5 inline-flex items-center gap-2">
                <span className="h-px w-6 bg-primary-500" />
                <span className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[#2BB5A2]">{t('landing.testimonials.label')}</span>
              </div>
              <h2 className="font-serif text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.15]">
                {t('landing.testimonials.heading1')}{' '}
                <span className="font-serif italic text-white/70">{t('landing.testimonials.heading2')}</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote: t('landing.testimonials.quote1'),
                name: t('landing.testimonials.name1'),
                role: t('landing.testimonials.role1'),
                gradient: 'from-primary-500 to-primary-700',
              },
              {
                quote: t('landing.testimonials.quote2'),
                name: t('landing.testimonials.name2'),
                role: t('landing.testimonials.role2'),
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                quote: t('landing.testimonials.quote3'),
                name: t('landing.testimonials.name3'),
                role: t('landing.testimonials.role3'),
                gradient: 'from-emerald-500 to-teal-500',
              },
              {
                quote: t('landing.testimonials.quote4'),
                name: t('landing.testimonials.name4'),
                role: t('landing.testimonials.role4'),
                gradient: 'from-amber-500 to-orange-500',
              },
              {
                quote: t('landing.testimonials.quote5'),
                name: t('landing.testimonials.name5'),
                role: t('landing.testimonials.role5'),
                gradient: 'from-cyan-500 to-blue-500',
              },
              {
                quote: t('landing.testimonials.quote6'),
                name: t('landing.testimonials.name6'),
                role: t('landing.testimonials.role6'),
                gradient: 'from-rose-500 to-pink-500',
              },
            ].map((testimonial, i) => (
              <Reveal key={testimonial.name} delay={i * 60}>
                <div className="group h-full rounded-2xl border border-white/[0.08] bg-[#12161B] p-6 transition-all duration-500 hover:border-white/[0.15]">
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-amber-400/80 text-amber-400/80" />
                    ))}
                  </div>
                  <p className="mb-6 text-[14px] leading-relaxed text-white/70">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.gradient} text-[11px] font-bold text-white shadow-sm`}>
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-white">{testimonial.name}</p>
                      <p className="text-[13px] text-white/70">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <div className="mb-5 inline-flex items-center gap-2">
                <span className="h-px w-6 bg-primary-500" />
                <span className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[#2BB5A2]">{t('landing.pricing.label')}</span>
              </div>
              <h2 className="mb-4 font-serif text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.15]">
                {t('landing.pricing.heading')}
              </h2>
              <p className="text-[18px] leading-[1.7] text-white/70">
                {t('landing.pricing.subtitle')}
              </p>

              <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#12161B] p-1">
                <button
                  onClick={() => setBilling('monthly')}
                  className={`rounded-full px-5 py-2.5 text-[14px] font-medium transition-all duration-300 ${
                    billing === 'monthly' ? 'bg-primary-500 text-white shadow-md' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {t('landing.pricing.monthly')}
                </button>
                <button
                  onClick={() => setBilling('yearly')}
                  className={`rounded-full px-5 py-2.5 text-[14px] font-medium transition-all duration-300 ${
                    billing === 'yearly' ? 'bg-primary-500 text-white shadow-md' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {t('landing.pricing.yearly')}
                  {billing !== 'yearly' && <span className="ml-1.5 text-[11px] font-semibold text-primary-400">{t('landing.pricing.save20')}</span>}
                </button>
              </div>
            </div>
          </Reveal>

          <div className="mx-auto grid max-w-5xl items-stretch gap-5 lg:grid-cols-3">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div
                  className={`relative flex h-full flex-col rounded-2xl border transition-all duration-400 ${
                    plan.highlighted
                      ? 'scale-[1.02] border-primary-500 bg-[#12161B] p-10 shadow-[0_0_40px_rgba(28,140,125,0.25)]'
                      : 'border-white/[0.08] bg-[#12161B] p-10 hover:border-white/[0.15]'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="flex items-center gap-1.5 rounded-full bg-primary-500 px-4 py-1 text-[11px] font-semibold tracking-[0.05em] shadow-lg">
                        <Crown className="h-3 w-3" />
                        {t('landing.pricing.mostPopular')}
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-[18px] font-semibold">{plan.name}</h3>
                    <p className="mt-1 text-[14px] text-white/70">{plan.desc}</p>
                  </div>

                  <div className="mb-1">
                    {plan.price !== null ? (
                      <div className="flex items-baseline gap-1">
                        <span className="font-serif text-[3rem] font-semibold">
                          {(billing === 'yearly' ? plan.yearlyPrice : plan.price)?.toLocaleString()}
                        </span>
                        <span className="ml-1 text-[20px] text-white/70">ETB</span>
                      </div>
                    ) : (
                      <div className="font-serif text-[3rem] font-semibold">{t('landing.pricing.custom')}</div>
                    )}
                  </div>
                  <p className="mb-8 text-[14px] text-white/70">
                    {plan.price === 0 ? t('landing.pricing.freeForeverNoCard') : plan.price !== null ? t('landing.pricing.etbPerUserMo') : 'Tailored to your organization'}
                  </p>

                  <ul className="mb-8 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-[14px] text-white/70">
                        <Check className="h-3.5 w-3.5 flex-shrink-0 text-[#2BB5A2]" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.price === null ? '#contact' : '/auth/signup'}
                    className={`mt-auto block w-full rounded-full py-3 text-center text-[14px] font-semibold transition-all duration-300 ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-primary-500 to-[#2BB5A2] text-white shadow-lg shadow-primary-500/20 hover:shadow-xl hover:brightness-110'
                        : 'border border-white/[0.15] text-white hover:border-primary-500 hover:shadow-[0_0_20px_rgba(28,140,125,0.25)]'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══ COMPARISON ═══ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <Reveal>
            <h3 className="mb-10 text-center font-serif text-xl font-medium sm:mb-14 sm:text-2xl">
              {t('landing.comparison.heading')}
            </h3>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { from: 'Jira', reasons: [t('landing.comparison.jira.reason1'), t('landing.comparison.jira.reason2'), t('landing.comparison.jira.reason3'), t('landing.comparison.jira.reason4')] },
              { from: 'Trello', reasons: [t('landing.comparison.trello.reason1'), t('landing.comparison.trello.reason2'), t('landing.comparison.trello.reason3'), t('landing.comparison.trello.reason4')] },
              { from: t('landing.comparison.spreadsheets.name'), reasons: [t('landing.comparison.spreadsheets.reason1'), t('landing.comparison.spreadsheets.reason2'), t('landing.comparison.spreadsheets.reason3'), t('landing.comparison.spreadsheets.reason4')] },
            ].map((item, i) => (
              <Reveal key={item.from} delay={i * 80}>
                <div className="group h-full rounded-2xl border border-white/[0.08] bg-[#12161B] p-6 transition-all duration-500 hover:border-white/[0.15]">
                  <p className="mb-5 text-[14px] font-medium">
                    {t('landing.comparison.switchingFrom')} <span className="text-primary-400">{item.from}</span>?
                  </p>
                  <ul className="space-y-2.5">
                    {item.reasons.map((r) => (
                      <li key={r} className="flex items-center gap-2.5 text-[14px] text-white/70">
                        <X className="h-3.5 w-3.5 flex-shrink-0 text-red-400/40" />
                        {r}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 border-t border-white/[0.08] pt-5">
                    <p className="flex items-center gap-2 text-[14px] font-medium text-emerald-400">
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

      <SectionDivider />

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-primary-500/[0.06] to-violet-500/[0.03] px-6 py-16 text-center sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-primary-500/[0.08] blur-[80px]" />
            <div className="relative">
              <Reveal>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[14px] font-medium text-emerald-400">INSA Certified</span>
                  <span className="h-3 w-px bg-white/10" />
                  <span className="text-[14px] text-white/70">7-day free trial</span>
                </div>
                <h2 className="font-serif text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.15]">
                  {t('landing.cta.heading1')}
                  <br />
                  <span className="font-serif italic text-[#2BB5A2]">{t('landing.cta.heading2')}</span>
                </h2>
                <p className="mx-auto mt-5 max-w-[560px] text-[18px] leading-[1.7] text-white/70">
                  {t('landing.cta.subtitle')}
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/auth/signup"
                    className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 px-8 py-4 text-[15px] font-semibold text-white shadow-xl shadow-primary-500/20 transition-all hover:shadow-2xl hover:shadow-primary-500/30 hover:brightness-110 active:scale-[0.98] sm:w-auto"
                  >
                    {t('landing.cta.getStartedFree')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <a
                    href="mailto:hello@onekof.com"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.1] px-8 py-4 text-[15px] font-medium text-white/70 transition-all hover:border-white/[0.2] hover:text-white sm:w-auto"
                  >
                    {t('landing.cta.talkToSales')}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1200px] px-6 py-14 sm:py-16">
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary-500 to-violet-600 shadow-lg">
                  <span className="text-[13px] font-black text-white">O</span>
                </div>
                <span className="text-[17px] font-bold">Onekof</span>
              </div>
              <p className="mt-4 max-w-xs text-[14px] leading-[1.7] text-white/70">
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
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[11px] font-bold text-white/70 transition-all hover:border-primary-500/20 hover:bg-primary-500/10 hover:text-primary-400"
                  >
                    {social.letter}
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: t('landing.footer.productCol'), links: [
                { label: t('landing.footer.footerLinks.features'), href: '#features' },
                { label: t('landing.footer.footerLinks.pricing'), href: '#pricing' },
                { label: t('landing.footer.footerLinks.integrations'), href: '#' },
                { label: t('landing.footer.footerLinks.changelog'), href: '#' },
                { label: t('landing.footer.footerLinks.roadmap'), href: '#' },
              ]},
              { title: t('landing.footer.companyCol'), links: [
                { label: t('landing.footer.footerLinks.about'), href: '/about' },
                { label: t('landing.footer.footerLinks.blog'), href: '#' },
                { label: t('landing.footer.footerLinks.careers'), href: '#' },
                { label: t('landing.footer.footerLinks.press'), href: '#' },
                { label: t('landing.footer.footerLinks.contact'), href: '#' },
              ]},
              { title: t('landing.footer.resourcesCol'), links: [
                { label: t('landing.footer.footerLinks.documentation'), href: '#' },
                { label: t('landing.footer.footerLinks.helpCenter'), href: '#' },
                { label: t('landing.footer.footerLinks.apiReference'), href: '#' },
                { label: t('landing.footer.footerLinks.community'), href: '#' },
                { label: t('landing.footer.footerLinks.status'), href: '#' },
              ]},
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-5 text-[13px] font-semibold uppercase tracking-[0.1em] text-white/30">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-[14px] text-white/70 transition-colors hover:text-white">{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
            <p className="text-[14px] text-white/30">
              &copy; {new Date().getFullYear()} Onekof. {t('landing.footer.allRightsReserved')}
            </p>
            <div className="flex gap-6">
              {[
                { label: t('landing.footer.privacy'), href: '/privacy' },
                { label: t('landing.footer.terms'), href: '/terms' },
                { label: t('landing.footer.cookies'), href: '/cookies' },
              ].map((link) => (
                <a key={link.href} href={link.href} className="text-[14px] text-white/30 transition-colors hover:text-white/70">{link.label}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

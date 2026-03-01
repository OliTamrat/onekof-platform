'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Calendar,
  Globe,
  Sparkles,
  Zap,
  Shield,
  MessageSquare,
} from 'lucide-react';

export default function HomePage() {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
                <span className="text-sm font-semibold text-white">O</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">Onekof</span>
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>

              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <Globe className="h-4 w-4" />
                  <span>{selectedLanguage}</span>
                </button>
                {isLanguageOpen && (
                  <div className="absolute right-0 top-full mt-2 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    {['English', 'አማርኛ', 'Afaan Oromoo', 'ትግርኛ'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setSelectedLanguage(lang);
                          setIsLanguageOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/auth/signin" className="text-sm text-gray-600 hover:text-gray-900">
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-32 pb-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-semibold leading-tight tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
            Project management
            <br />
            that works for you
          </h1>
          <p className="mb-10 text-xl text-gray-600">
            Built for teams that need speed, flexibility, and clarity.
            <br />
            No clutter. Just results.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
              View Demo
            </button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4" />
              Free for 10 users
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4" />
              No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4" />
              2-minute setup
            </span>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gray-300" />
                <div className="h-3 w-3 rounded-full bg-gray-300" />
                <div className="h-3 w-3 rounded-full bg-gray-300" />
              </div>
            </div>
            <div className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Mobile App Launch</h3>
                  <p className="text-sm text-gray-500">12 tasks • 4 members</p>
                </div>
                <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white">
                  Add Task
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {['To Do', 'In Progress', 'Done'].map((status) => (
                  <div key={status} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-3 text-xs font-medium text-gray-500">{status}</div>
                    <div className="space-y-2">
                      <div className="rounded-lg border border-gray-200 bg-white p-3">
                        <div className="text-sm font-medium text-gray-900">Design review</div>
                        <div className="mt-2 flex items-center gap-1">
                          <div className="h-6 w-6 rounded-full bg-gray-200" />
                          <div className="h-6 w-6 rounded-full bg-gray-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-200 bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { value: '500+', label: 'Teams' },
              { value: '50K+', label: 'Tasks' },
              { value: '10x', label: 'Faster' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mb-1 text-4xl font-semibold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-semibold text-gray-900">
              Everything you need
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features. Simple to use.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Calendar, title: 'Smart Calendar', description: 'Multiple calendar systems with automatic conversions.' },
              { icon: Globe, title: '4 Languages', description: 'Work in Amharic, Afaan Oromoo, Tigrinya, or English.' },
              { icon: Sparkles, title: 'AI-Powered', description: 'Turn ideas into tasks instantly with AI.' },
              { icon: Zap, title: 'Lightning Fast', description: 'Built for speed with offline support.' },
              { icon: Shield, title: 'Enterprise Security', description: 'Bank-grade encryption and SOC 2 certified.' },
              { icon: MessageSquare, title: 'Real-Time Collaboration', description: 'Comments, mentions, and file sharing.' },
            ].map((feature) => (
              <div key={feature.title} className="rounded-lg border border-gray-200 bg-white p-6">
                <feature.icon className="mb-4 h-6 w-6 text-gray-900" />
                <h3 className="mb-2 font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-semibold text-gray-900">
              Trusted by teams worldwide
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { quote: "Onekof helped us ship 10x faster. Simple, powerful, essential.", author: "Alex Chen", role: "Engineering Manager" },
              { quote: "Best PM tool we've used. Clean interface, zero learning curve.", author: "Sarah Kim", role: "Product Lead" },
              { quote: "Switched from Jira. Never looking back. So much better.", author: "Michael Torres", role: "CTO" },
            ].map((testimonial, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-6">
                <p className="mb-4 text-gray-700">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{testimonial.author}</div>
                    <div className="text-xs text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-semibold text-gray-900">Simple pricing</h2>
            <p className="text-lg text-gray-600">Start free. Scale when ready.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-8">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-semibold text-gray-900">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="mb-8 space-y-3 text-sm text-gray-600">
                {['10 users', 'Unlimited projects', 'Smart calendar', '4 languages'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block w-full rounded-lg border border-gray-300 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
                Get Started
              </Link>
            </div>

            <div className="rounded-lg border-2 border-gray-900 bg-white p-8">
              <div className="mb-2 inline-block rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white">
                Most Popular
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-semibold text-gray-900">$8</span>
                <span className="text-gray-500">/user/month</span>
              </div>
              <ul className="mb-8 space-y-3 text-sm text-gray-600">
                {['Unlimited users', 'Everything in Free', 'Advanced AI', 'Priority support', 'Analytics', 'API access'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block w-full rounded-lg bg-gray-900 py-2 text-center text-sm font-medium text-white hover:bg-gray-800">
                Start Free Trial
              </Link>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-8">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-semibold text-gray-900">Custom</span>
              </div>
              <ul className="mb-8 space-y-3 text-sm text-gray-600">
                {['Everything in Pro', 'Dedicated support', 'Custom integrations', 'On-premise', 'SLA guarantee'].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="#contact" className="block w-full rounded-lg border border-gray-300 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-semibold text-gray-900">
            Ready to get started?
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            Join 500+ teams building better products
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Start Building Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
                  <span className="text-sm font-semibold text-white">O</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">Onekof</span>
              </div>
              <p className="text-sm text-gray-600">
                Modern project management for teams that move fast.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers'] },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">{col.title}</h3>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-gray-600 hover:text-gray-900">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
            © 2026 Onekof. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

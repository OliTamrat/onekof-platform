'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  CheckCircle2, ArrowRight, Building2, Users, Calendar, Globe,
  Sparkles, Loader2, ChevronRight, Target, Zap, Shield,
  Download, Smartphone, AppWindow
} from 'lucide-react';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [organizationName, setOrganizationName] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [industry, setIndustry] = useState('');
  const [useCase, setUseCase] = useState('');
  const [language, setLanguage] = useState('english');

  const totalSteps = 4;

  // Auto-suggest slug from organization name
  useEffect(() => {
    if (organizationName) {
      const slug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setOrganizationSlug(slug);
    }
  }, [organizationName]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      // Create organization
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: organizationName,
          slug: organizationSlug,
          teamSize,
          industry,
          useCase,
          language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to the new organization's subdomain
        const protocol = window.location.protocol;
        const port = window.location.port ? `:${window.location.port}` : '';

        if (window.location.hostname.includes('onekof.com')) {
          window.location.href = `${protocol}//${organizationSlug}.onekof.com/dashboard`;
        } else {
          window.location.href = `${protocol}//${organizationSlug}.localhost${port}/dashboard`;
        }
      } else {
        alert('Failed to create organization. Please try again.');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-400/30 to-cyan-400/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />

      {/* Main Content */}
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">

            {/* Left Section - Promo */}
            <div className="flex flex-col justify-center space-y-8">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/50">
                  <span className="text-2xl font-bold text-white">O</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Onekof</h1>
                  <p className="text-sm text-gray-600">Project Management Platform</p>
                </div>
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h2 className="text-4xl font-bold leading-tight text-gray-900 lg:text-5xl">
                  Welcome to<br />
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Your Workspace
                  </span>
                </h2>
                <p className="text-lg text-gray-600">
                  Set up your organization in just a few steps. Get your team started with Ethiopian calendar, 4 native languages, and AI-powered workflows.
                </p>
              </div>

              {/* Mobile Apps Section */}
              <div className="rounded-2xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-xl p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Download Our Mobile App</h3>
                    <p className="text-sm text-gray-600">Access your projects on the go</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="#"
                    className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-black px-5 py-3 transition-opacity hover:opacity-90"
                  >
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="white">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] leading-none text-white/80">Download on the</span>
                      <span className="text-base font-semibold leading-tight text-white">App Store</span>
                    </div>
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-black px-5 py-3 transition-opacity hover:opacity-90"
                  >
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="white">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                    </svg>
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] leading-none text-white/80">GET IT ON</span>
                      <span className="text-base font-semibold leading-tight text-white">Google Play</span>
                    </div>
                  </a>
                </div>
              </div>

              {/* Multi-Tenant Features */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900">Multi-Tenant Features:</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700"><strong>Dedicated Subdomain:</strong> yourcompany.onekof.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700"><strong>Complete Data Isolation:</strong> Your data stays private</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700"><strong>Custom Branding:</strong> Make it your own</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700"><strong>Unlimited Members:</strong> Invite your whole team</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Onboarding Steps */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
                    <span className="text-sm font-medium text-indigo-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
                      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Glassmorphism Card */}
                <div className="rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/20 shadow-2xl p-8">

                  {/* Step 1: Organization Name */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">Create Organization</h3>
                        </div>
                        <p className="text-gray-600">Let's start by naming your workspace</p>
                      </div>

                      <div>
                        <label htmlFor="orgName" className="block text-sm font-semibold text-gray-700 mb-2">
                          Organization Name
                        </label>
                        <input
                          id="orgName"
                          type="text"
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          required
                          className="w-full rounded-xl border-2 border-gray-200 bg-white/50 py-3.5 px-4 text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                          placeholder="e.g., Ministry of Water, Acme Inc"
                        />
                      </div>

                      <div>
                        <label htmlFor="orgSlug" className="block text-sm font-semibold text-gray-700 mb-2">
                          Your Subdomain
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            id="orgSlug"
                            type="text"
                            value={organizationSlug}
                            onChange={(e) => setOrganizationSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            required
                            className="flex-1 rounded-xl border-2 border-gray-200 bg-white/50 py-3.5 px-4 text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                            placeholder="my-company"
                          />
                          <span className="text-sm text-gray-500">.onekof.com</span>
                        </div>
                        {organizationSlug && (
                          <p className="mt-2 text-xs text-indigo-600">
                            Your workspace will be available at: <strong>{organizationSlug}.onekof.com</strong>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Team Size */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                            <Users className="h-5 w-5 text-purple-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">Team Size</h3>
                        </div>
                        <p className="text-gray-600">How many people will use Onekof?</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {['1-10', '11-50', '51-200', '200+'].map((size) => (
                          <button
                            key={size}
                            onClick={() => setTeamSize(size)}
                            className={`rounded-xl border-2 py-4 px-4 text-center font-semibold transition-all ${
                              teamSize === size
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 bg-white/50 text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {size} members
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Industry & Use Case */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100">
                            <Target className="h-5 w-5 text-pink-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">Tell Us More</h3>
                        </div>
                        <p className="text-gray-600">Help us personalize your experience</p>
                      </div>

                      <div>
                        <label htmlFor="industry" className="block text-sm font-semibold text-gray-700 mb-2">
                          Industry
                        </label>
                        <select
                          id="industry"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          className="w-full rounded-xl border-2 border-gray-200 bg-white/50 py-3.5 px-4 text-gray-900 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                        >
                          <option value="">Select industry</option>
                          <option value="government">Government/Public Sector</option>
                          <option value="technology">Technology</option>
                          <option value="construction">Construction</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="education">Education</option>
                          <option value="finance">Finance</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="useCase" className="block text-sm font-semibold text-gray-700 mb-2">
                          Primary Use Case
                        </label>
                        <select
                          id="useCase"
                          value={useCase}
                          onChange={(e) => setUseCase(e.target.value)}
                          className="w-full rounded-xl border-2 border-gray-200 bg-white/50 py-3.5 px-4 text-gray-900 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                        >
                          <option value="">Select use case</option>
                          <option value="project-management">Project Management</option>
                          <option value="task-tracking">Task Tracking</option>
                          <option value="budget-management">Budget Management</option>
                          <option value="team-collaboration">Team Collaboration</option>
                          <option value="all">All of the above</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Language Preference */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                            <Globe className="h-5 w-5 text-green-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">Language Preference</h3>
                        </div>
                        <p className="text-gray-600">Choose your preferred language</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'english', label: 'English' },
                          { value: 'amharic', label: 'አማርኛ (Amharic)' },
                          { value: 'oromo', label: 'Afaan Oromo' },
                          { value: 'tigrinya', label: 'ትግርኛ (Tigrinya)' },
                        ].map((lang) => (
                          <button
                            key={lang.value}
                            onClick={() => setLanguage(lang.value)}
                            className={`rounded-xl border-2 py-4 px-4 text-center font-semibold transition-all ${
                              language === lang.value
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 bg-white/50 text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>

                      <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-semibold text-green-900 mb-1">You're all set!</p>
                            <p className="text-green-700">
                              Click "Complete Setup" to create your workspace and start collaborating.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="mt-8 flex items-center justify-between">
                    {currentStep > 1 && (
                      <button
                        onClick={handleBack}
                        className="rounded-xl border-2 border-gray-200 bg-white/50 px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-white hover:border-gray-300"
                      >
                        Back
                      </button>
                    )}

                    {currentStep < totalSteps ? (
                      <button
                        onClick={handleNext}
                        disabled={
                          (currentStep === 1 && (!organizationName || !organizationSlug)) ||
                          (currentStep === 2 && !teamSize)
                        }
                        className="ml-auto group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <div className="flex items-center gap-2">
                          <span>Continue</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </button>
                    ) : (
                      <button
                        onClick={handleComplete}
                        disabled={isLoading}
                        className="ml-auto group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Setting up...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>Complete Setup</span>
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-gray-500">
                  © 2026 Onekof. Built with ❤️ in Ethiopia 🇪🇹
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}

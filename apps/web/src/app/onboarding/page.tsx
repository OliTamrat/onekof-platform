'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  CheckCircle2, ArrowRight, ArrowLeft, Building2, Users, Globe,
  Sparkles, Loader2, Calendar, Target, Zap, Shield, Smartphone,
  GraduationCap, HeartHandshake, Construction, HeartPulse, Landmark,
  Briefcase, Languages
} from 'lucide-react';

// Organization types with icons and features
const ORG_TYPES = [
  {
    id: 'government',
    label: 'Government Ministry',
    icon: Landmark,
    color: 'blue',
    features: ['Budget tracking', 'Compliance tools', 'Public procurement', 'Ethiopian calendar'],
    description: 'For Ethiopian federal and regional government agencies'
  },
  {
    id: 'private',
    label: 'Private Company',
    icon: Briefcase,
    color: 'purple',
    features: ['Agile workflows', 'Client projects', 'Team collaboration', 'Time tracking'],
    description: 'For tech companies, startups, and businesses'
  },
  {
    id: 'ngo',
    label: 'NGO/INGO',
    icon: HeartHandshake,
    color: 'emerald',
    features: ['Grant management', 'Impact tracking', 'Donor reporting', 'Multi-currency'],
    description: 'For non-profit and international organizations'
  },
  {
    id: 'education',
    label: 'Educational Institution',
    icon: GraduationCap,
    color: 'amber',
    features: ['Course projects', 'Research tracking', 'Academic calendar', 'Student collaboration'],
    description: 'For universities, schools, and training centers'
  },
  {
    id: 'construction',
    label: 'Construction/Engineering',
    icon: Construction,
    color: 'orange',
    features: ['Site management', 'Equipment tracking', 'Safety compliance', 'Progress photos'],
    description: 'For construction firms and engineering companies'
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    icon: HeartPulse,
    color: 'red',
    features: ['Facility management', 'Medical projects', 'Compliance tracking', 'Resource allocation'],
    description: 'For hospitals, clinics, and health organizations'
  },
];

const TEAM_SIZES = [
  { value: '1-10', label: '1-10 people' },
  { value: '11-50', label: '11-50 people' },
  { value: '51-200', label: '51-200 people' },
  { value: '201-500', label: '201-500 people' },
  { value: '500+', label: '500+ people' },
];

const LANGUAGES = [
  { value: 'english', label: 'English', native: 'English' },
  { value: 'amharic', label: 'Amharic', native: 'አማርኛ' },
  { value: 'oromo', label: 'Oromo', native: 'Afaan Oromo' },
  { value: 'tigrinya', label: 'Tigrinya', native: 'ትግርኛ' },
];

function OnboardingContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form data - COLLECTING FOR CATEGORIZATION
  const [language, setLanguage] = useState(''); // User must select
  const [organizationType, setOrganizationType] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [department, setDepartment] = useState(''); // For government
  const [industry, setIndustry] = useState(''); // For private
  const [teamSize, setTeamSize] = useState('');
  const [primaryUseCases, setPrimaryUseCases] = useState<string[]>([]);
  const [calendarPreference, setCalendarPreference] = useState('ethiopian');

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
      // Create organization with ALL categorization data
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: organizationName,
          slug: organizationSlug,
          // CATEGORIZATION DATA
          type: organizationType,
          department,
          industry,
          teamSize,
          primaryUseCases,
          language,
          calendarPreference,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to organization selection page instead of directly to dashboard
        const protocol = window.location.protocol;
        const port = window.location.port ? `:${window.location.port}` : '';

        if (window.location.hostname.includes('onekof.com')) {
          window.location.href = `${protocol}//onekof.com/select-organization`;
        } else {
          window.location.href = `${protocol}//localhost${port}/select-organization`;
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

  const canProceedStep1 = language !== '';
  const canProceedStep2 = organizationType !== '';
  const canProceedStep3 = organizationName && organizationSlug && teamSize;
  const canComplete = true;

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-800/50">
        <Loader2 className="h-8 w-8 animate-spin text-[#1C8C7D]" />
      </div>
    );
  }

  const selectedOrgType = ORG_TYPES.find(t => t.id === organizationType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B1F23] via-[#22272B] to-[#1B1F23] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-[#1C8C7D]/20 to-emerald-600/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-[#1C8C7D]/15 to-teal-600/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Ethiopian flag accent */}
      <div className="fixed top-0 left-0 right-0 h-1 flex z-50">
        <div className="flex-1 bg-[#078930]" />
        <div className="flex-1 bg-[#FCDD09]" />
        <div className="flex-1 bg-[#DA121A]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 pt-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1C8C7D] to-emerald-600 shadow-lg">
                <span className="text-xl font-bold text-white">O</span>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-white">Onekof</h1>
                <p className="text-xs text-slate-300">Enterprise Project Management</p>
              </div>
            </div>

            {/* Ethiopian Greeting */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  እንኳን ደህና መጡ ወደ ኦነኮፍ!
                </h2>
                <p className="text-lg text-slate-300">
                  Welcome to Onekof! • Baga nagaan dhuftan!
                </p>
              </div>
            )}
            {currentStep > 1 && (
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {currentStep === 2 && 'What type of organization are you?'}
                  {currentStep === 3 && 'Tell us about your organization'}
                  {currentStep === 4 && 'Final step: Create your workspace'}
                </h2>
                <p className="text-slate-300">
                  {currentStep === 2 && 'This helps us set up the right features for you'}
                  {currentStep === 3 && 'We\'ll use this to personalize your experience'}
                  {currentStep === 4 && 'Your workspace will be ready in seconds'}
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm font-semibold text-[#1C8C7D]">{Math.round((currentStep / totalSteps) * 100)}% complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-700/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#1C8C7D] to-emerald-600 transition-all duration-500 shadow-lg shadow-[#1C8C7D]/30"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Main Card */}
          <div className="rounded-2xl bg-[#22272B]/60 backdrop-blur-xl border-2 border-slate-700/50 shadow-2xl p-8 md:p-10">
            {/* STEP 1: Language Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1C8C7D]/20 border border-[#1C8C7D]/30 mb-4">
                    <Languages className="h-8 w-8 text-[#1C8C7D]" />
                  </div>
                  <p className="text-slate-300">Choose your preferred language for the platform</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => setLanguage(lang.value)}
                      className={`relative rounded-lg border-2 p-4 text-left transition-all ${
                        language === lang.value
                          ? 'border-[#1C8C7D] bg-[#1C8C7D]/10 shadow-lg shadow-[#1C8C7D]/20'
                          : 'border-slate-600/50 bg-slate-800/30 hover:border-slate-500 hover:shadow-md'
                      }`}
                    >
                      {language === lang.value && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 className="h-5 w-5 text-[#1C8C7D]" />
                        </div>
                      )}
                      <div className="text-xl font-bold text-white mb-0.5">{lang.native}</div>
                      <div className="text-xs text-slate-400">{lang.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Organization Type - CRITICAL FOR CATEGORIZATION */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ORG_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setOrganizationType(type.id)}
                        className={`relative rounded-lg border-2 p-4 text-left transition-all ${
                          organizationType === type.id
                            ? 'border-[#1C8C7D] bg-[#1C8C7D]/10 shadow-lg shadow-[#1C8C7D]/20'
                            : 'border-slate-600/50 bg-slate-800/30 hover:border-slate-500 hover:shadow-md'
                        }`}
                      >
                        {organizationType === type.id && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle2 className="h-5 w-5 text-[#1C8C7D]" />
                          </div>
                        )}
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#1C8C7D]/20 border border-[#1C8C7D]/30 mb-3">
                          <Icon className="h-5 w-5 text-[#1C8C7D]" />
                        </div>
                        <div className="text-base font-bold text-white mb-1.5">{type.label}</div>
                        <p className="text-xs text-slate-400 mb-2">{type.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {type.features.slice(0, 2).map((feature) => (
                            <span key={feature} className="text-xs bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded border border-slate-600/30">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Organization Details - CONTEXTUAL! */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-600/50 bg-slate-800/50 py-3.5 px-4 text-white placeholder-slate-400 transition-all focus:border-[#1C8C7D] focus:outline-none focus:ring-4 focus:ring-[#1C8C7D]/20"
                    placeholder={organizationType === 'government' ? 'e.g., Ministry of Water & Irrigation' : 'Your organization name'}
                  />
                </div>

                {/* Conditional field for government */}
                {organizationType === 'government' && (
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Department/Bureau (Optional)
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-600/50 bg-slate-800/50 py-3.5 px-4 text-white placeholder-slate-400 transition-all focus:border-[#1C8C7D] focus:outline-none focus:ring-4 focus:ring-[#1C8C7D]/20"
                      placeholder="e.g., Planning & Budget Bureau"
                    />
                  </div>
                )}

                {/* Conditional field for private */}
                {organizationType === 'private' && (
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Industry
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-600/50 bg-slate-800/50 py-3.5 px-4 text-white transition-all focus:border-[#1C8C7D] focus:outline-none focus:ring-4 focus:ring-[#1C8C7D]/20"
                    >
                      <option value="">Select industry</option>
                      <option value="technology">Technology</option>
                      <option value="finance">Finance</option>
                      <option value="retail">Retail</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="consulting">Consulting</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Team Size
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {TEAM_SIZES.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setTeamSize(size.value)}
                        className={`rounded-lg border-2 py-2 px-3 text-sm font-semibold transition-all ${
                          teamSize === size.value
                            ? 'border-[#1C8C7D] bg-[#1C8C7D]/5 text-[#1C8C7D]'
                            : 'border-slate-600/50 text-white hover:border-slate-500'
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Workspace URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={organizationSlug}
                      onChange={(e) => setOrganizationSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="flex-1 rounded-xl border-2 border-slate-600/50 bg-slate-800/50 py-3.5 px-4 text-white placeholder-slate-400 transition-all focus:border-[#1C8C7D] focus:outline-none focus:ring-4 focus:ring-[#1C8C7D]/10"
                      placeholder="my-organization"
                    />
                    <span className="text-sm text-slate-400 whitespace-nowrap">.onekof.com</span>
                  </div>
                  {organizationSlug && (
                    <p className="mt-2 text-xs text-[#1C8C7D]">
                      Your workspace: <strong>{organizationSlug}.onekof.com</strong>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: Workspace Setup + Calendar */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Calendar Preference
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => setCalendarPreference('ethiopian')}
                      className={`rounded-lg border-2 p-3 text-left transition-all ${
                        calendarPreference === 'ethiopian'
                          ? 'border-[#1C8C7D] bg-[#1C8C7D]/5 shadow-lg'
                          : 'border-slate-600/50 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Calendar className="h-4 w-4 text-[#1C8C7D]" />
                        {calendarPreference === 'ethiopian' && (
                          <CheckCircle2 className="h-4 w-4 text-[#1C8C7D] ml-auto" />
                        )}
                      </div>
                      <div className="font-semibold text-white text-sm mb-0.5">Ethiopian</div>
                      <div className="text-xs text-slate-300">የኢትዮጵያ ዘመን አቆጣጠር</div>
                    </button>

                    <button
                      onClick={() => setCalendarPreference('gregorian')}
                      className={`rounded-lg border-2 p-3 text-left transition-all ${
                        calendarPreference === 'gregorian'
                          ? 'border-[#1C8C7D] bg-[#1C8C7D]/5 shadow-lg'
                          : 'border-slate-600/50 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Calendar className="h-4 w-4 text-slate-300" />
                        {calendarPreference === 'gregorian' && (
                          <CheckCircle2 className="h-4 w-4 text-[#1C8C7D] ml-auto" />
                        )}
                      </div>
                      <div className="font-semibold text-white text-sm mb-0.5">Gregorian</div>
                      <div className="text-xs text-slate-300">International</div>
                    </button>

                    <button
                      onClick={() => setCalendarPreference('both')}
                      className={`rounded-lg border-2 p-3 text-left transition-all ${
                        calendarPreference === 'both'
                          ? 'border-[#1C8C7D] bg-[#1C8C7D]/5 shadow-lg'
                          : 'border-slate-600/50 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Globe className="h-4 w-4 text-purple-600" />
                        {calendarPreference === 'both' && (
                          <CheckCircle2 className="h-4 w-4 text-[#1C8C7D] ml-auto" />
                        )}
                      </div>
                      <div className="font-semibold text-white text-sm mb-0.5">Both</div>
                      <div className="text-xs text-slate-300">Show both calendars</div>
                    </button>
                  </div>
                </div>

                {/* Mobile App Promo */}
                <div className="rounded-xl bg-gradient-to-br from-[#1C8C7D]/10 to-emerald-100/50 border border-[#1C8C7D]/20 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1C8C7D]">
                      <Smartphone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Download Mobile App</div>
                      <div className="text-sm text-slate-300">Manage on the go</div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a href="#" className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm text-white hover:bg-black/80 transition-colors">
                      <span>📱 App Store</span>
                    </a>
                    <a href="#" className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm text-white hover:bg-black/80 transition-colors">
                      <span>📱 Google Play</span>
                    </a>
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-white mb-2">You're all set!</p>
                      <p className="text-sm text-slate-300 mb-3">
                        Based on your selections, we've enabled features for{' '}
                        <strong className="text-white">{selectedOrgType?.label}</strong> with {language === 'amharic' ? 'አማርኛ' : language === 'oromo' ? 'Afaan Oromo' : language === 'tigrinya' ? 'ትግርኛ' : 'English'} language support.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedOrgType?.features.map((feature) => (
                          <span key={feature} className="text-xs bg-slate-700/50 text-emerald-300 px-2 py-1 rounded border border-emerald-500/30">
                            ✓ {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-600/50 bg-slate-800/50 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-700/30 hover:border-slate-500"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2) ||
                  (currentStep === 3 && !canProceedStep3)
                }
                className="ml-auto group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1C8C7D] to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1C8C7D]/20 transition-all hover:shadow-xl hover:shadow-[#1C8C7D]/30 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#1C8C7D]/30 disabled:opacity-50 disabled:hover:scale-100"
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
                className="ml-auto group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-emerald-500/30 disabled:opacity-50 disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating workspace...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Launch Workspace</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
              </button>
            )}
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-400">
            © 2026 Onekof. Built with ❤️ for Ethiopia
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-800/50">
        <Loader2 className="h-8 w-8 animate-spin text-[#1C8C7D]" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}

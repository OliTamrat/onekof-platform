'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast-provider';
import {
  CheckCircle2, ArrowRight, ArrowLeft, Building2, Users, Globe,
  Sparkles, Loader2, Calendar, Target, Zap, Shield, Smartphone,
  GraduationCap, HeartHandshake, Construction, HeartPulse, Landmark,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';


function OnboardingContent() {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const toast = useToast();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Organization types with icons and features
  const ORG_TYPES = [
    {
      id: 'personal',
      label: t('onboarding.personalWorkspace'),
      icon: Users,
      color: 'teal',
      features: [t('onboarding.personalTasks'), t('onboarding.soloProjects'), t('onboarding.quickSetup'), t('onboarding.upgradeAnytime')],
      description: t('onboarding.forIndividual')
    },
    {
      id: 'government',
      label: t('onboarding.govMinistry'),
      icon: Landmark,
      color: 'blue',
      features: [t('onboarding.budgetTracking'), t('onboarding.complianceTools'), t('onboarding.publicProcurement'), t('onboarding.ethiopianCalendar')],
      description: t('onboarding.forEthGov')
    },
    {
      id: 'private',
      label: t('onboarding.privateCompany'),
      icon: Briefcase,
      color: 'purple',
      features: [t('onboarding.agileWorkflows'), t('onboarding.clientProjects'), t('onboarding.teamCollaboration'), t('onboarding.timeTracking')],
      description: t('onboarding.forTechCompanies')
    },
    {
      id: 'ngo',
      label: t('onboarding.ngoIngo'),
      icon: HeartHandshake,
      color: 'emerald',
      features: [t('onboarding.grantManagement'), t('onboarding.impactTracking'), t('onboarding.donorReporting'), t('onboarding.multiCurrency')],
      description: t('onboarding.forNonProfit')
    },
    {
      id: 'education',
      label: t('onboarding.educationalInstitution'),
      icon: GraduationCap,
      color: 'amber',
      features: [t('onboarding.courseProjects'), t('onboarding.researchTracking'), t('onboarding.academicCalendar'), t('onboarding.studentCollaboration')],
      description: t('onboarding.forUniversities')
    },
    {
      id: 'construction',
      label: t('onboarding.constructionEngineering'),
      icon: Construction,
      color: 'orange',
      features: [t('onboarding.siteManagement'), t('onboarding.equipmentTracking'), t('onboarding.safetyCompliance'), t('onboarding.progressPhotos')],
      description: t('onboarding.forConstruction')
    },
    {
      id: 'healthcare',
      label: t('onboarding.healthcare'),
      icon: HeartPulse,
      color: 'red',
      features: [t('onboarding.facilityManagement'), t('onboarding.medicalProjects'), t('onboarding.complianceTracking'), t('onboarding.resourceAllocation')],
      description: t('onboarding.forHospitals')
    },
  ];

  const TEAM_SIZES = [
    { value: '1-10', label: t('onboarding.people1to10') },
    { value: '11-50', label: t('onboarding.people11to50') },
    { value: '51-200', label: t('onboarding.people51to200') },
    { value: '201-500', label: t('onboarding.people201to500') },
    { value: '500+', label: t('onboarding.people500plus') },
  ];

  // CRITICAL: Redirect to main domain if accessing from subdomain
  useEffect(() => {
    const hostname = window.location.hostname;

    // Check if we're on a subdomain (not main domain)
    const isSubdomain =
      (hostname.includes('.onekof.com') && hostname !== 'onekof.com' && hostname !== 'www.onekof.com') ||
      (hostname.includes('.localhost') && hostname !== 'localhost');

    if (isSubdomain) {
      // Redirect to main domain
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';

      if (hostname.includes('onekof.com')) {
        window.location.href = `${protocol}//onekof.com/onboarding`;
      } else {
        window.location.href = `${protocol}//localhost${port}/onboarding`;
      }
    }
  }, []);



  // Form data - COLLECTING FOR CATEGORIZATION
  const [organizationType, setOrganizationType] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [department, setDepartment] = useState(''); // For government
  const [industry, setIndustry] = useState(''); // For private
  const [teamSize, setTeamSize] = useState('');
  const [primaryUseCases, setPrimaryUseCases] = useState<string[]>([]);
  const [calendarPreference, setCalendarPreference] = useState('ethiopian');

  const isPersonalWorkspace = organizationType === 'personal';
  const totalSteps = isPersonalWorkspace ? 1 : 3;

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

  const redirectToSelectOrg = () => {
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : '';

    if (window.location.hostname.includes('onekof.com')) {
      window.location.href = `${protocol}//onekof.com/select-organization`;
    } else {
      window.location.href = `${protocol}//localhost${port}/select-organization`;
    }
  };

  const handlePersonalWorkspaceSetup = async () => {
    setIsLoading(true);

    try {
      // Finalize the existing placeholder workspace as a personal workspace
      const response = await fetch('/api/organizations/finalize-personal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        await updateSession();
        redirectToSelectOrg();
      } else {
        toast.error('Setup failed', data.error || 'Please try again.');
      }
    } catch (error) {
      console.error('Error setting up personal workspace:', error);
      toast.error('Network error', 'Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (isPersonalWorkspace) {
      return handlePersonalWorkspaceSetup();
    }

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
          language: 'en',
          calendarPreference,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Delete the auto-created placeholder workspace (type="personal") since user
        // created a proper organization workspace.
        try {
          await fetch('/api/organizations/cleanup-placeholder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newOrganizationId: data.organization.id }),
          });
        } catch (cleanupError) {
          console.error('Failed to clean up placeholder workspace:', cleanupError);
        }

        await updateSession();
        redirectToSelectOrg();
      } else {
        toast.error('Organization creation failed', data.error || 'Please try again.');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Network error', 'Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedStep1 = organizationType !== '';
  const canProceedStep2 = organizationName && organizationSlug && teamSize;
  const canComplete = true;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1B1F23]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    );
  }

  const selectedOrgType = ORG_TYPES.find(t => t.id === organizationType);

  return (
    <div className="min-h-screen bg-[#1B1F23] relative overflow-hidden">
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gradient-to-br from-primary-500/[0.08] to-primary-700/[0.05] blur-3xl animate-pulse sm:-top-40 sm:-right-40 sm:h-96 sm:w-96" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-gradient-to-tr from-primary-500/[0.06] to-primary-700/[0.04] blur-3xl animate-pulse sm:-bottom-40 sm:-left-40 sm:h-96 sm:w-96" style={{ animationDelay: '2s' }} />
      </div>

      {/* Ethiopian flag accent */}
      <div className="fixed top-0 left-0 right-0 h-0.5 flex z-50">
        <div className="flex-1 bg-[#078930]" />
        <div className="flex-1 bg-[#FCDD09]" />
        <div className="flex-1 bg-[#DA121A]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 pt-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg">
                <span className="text-[16px] font-semibold text-white">O</span>
              </div>
              <div className="text-left">
                <h1 className="text-[16px] font-semibold text-white">Onekof</h1>
                <p className="text-xs text-white/60">{t('onboardingPage.enterprisePM')}</p>
              </div>
            </div>

            {/* Greeting */}
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white mb-2">
                {currentStep === 1 && t('onboardingPage.whatTypeWorkspace')}
                {currentStep === 2 && t('onboardingPage.tellUsAboutOrg')}
                {currentStep === 3 && t('onboardingPage.finalStepCreate')}
              </h2>
              <p className="text-white/60">
                {currentStep === 1 && t('onboardingPage.choosePersonalOrOrg')}
                {currentStep === 2 && t('onboardingPage.personalizeExperience')}
                {currentStep === 3 && t('onboardingPage.readyInSeconds')}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-medium text-white/50">{t('onboardingPage.step')} {currentStep} {t('onboardingPage.of')} {totalSteps}</span>
              <span className="text-[13px] font-medium text-primary-400">{Math.round((currentStep / totalSteps) * 100)}% {t('onboardingPage.complete')}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all duration-500 shadow-lg shadow-primary-500/30"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Main Card */}
          <div className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-2xl p-4 sm:p-8 md:p-10">
            {/* STEP 1: Organization Type - CRITICAL FOR CATEGORIZATION */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ORG_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.id}
                        onClick={() => setOrganizationType(type.id)}
                        className={`relative rounded-xl border p-4 text-left transition-all ${
                          organizationType === type.id
                            ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/20'
                            : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15] hover:shadow-md'
                        }`}
                      >
                        {organizationType === type.id && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle2 className="h-5 w-5 text-primary-400" />
                          </div>
                        )}
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/20 border border-primary-500/30 mb-3">
                          <Icon className="h-5 w-5 text-primary-400" />
                        </div>
                        <div className="text-[14px] font-medium text-white mb-1.5">{type.label}</div>
                        <p className="text-xs text-white/50 mb-2">{type.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {type.features.slice(0, 2).map((feature) => (
                            <span key={feature} className="text-xs bg-white/[0.06] text-white/60 px-2 py-0.5 rounded border border-white/[0.06]">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Organization Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-[13px] font-medium text-white/50 mb-2">
                    {t('onboardingPage.organizationName')}
                  </label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3.5 px-4 text-white placeholder-white/40 transition-all focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                    placeholder={organizationType === 'government' ? t('onboardingPage.govPlaceholder') : t('onboardingPage.orgPlaceholder')}
                  />
                </div>

                {/* Conditional field for government */}
                {organizationType === 'government' && (
                  <div>
                    <label className="block text-[13px] font-medium text-white/50 mb-2">
                      {t('onboardingPage.departmentBureau')}
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3.5 px-4 text-white placeholder-white/40 transition-all focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                      placeholder={t('onboardingPage.deptPlaceholder')}
                    />
                  </div>
                )}

                {/* Conditional field for private */}
                {organizationType === 'private' && (
                  <div>
                    <label className="block text-[13px] font-medium text-white/50 mb-2">
                      {t('onboardingPage.industry')}
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3.5 px-4 text-white transition-all focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                    >
                      <option value="">{t('onboardingPage.selectIndustry')}</option>
                      <option value="technology">{t('onboardingPage.technology')}</option>
                      <option value="finance">{t('onboardingPage.finance')}</option>
                      <option value="retail">{t('onboardingPage.retail')}</option>
                      <option value="manufacturing">{t('onboardingPage.manufacturing')}</option>
                      <option value="consulting">{t('onboardingPage.consulting')}</option>
                      <option value="other">{t('onboardingPage.other')}</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[13px] font-medium text-white/50 mb-2">
                    {t('onboardingPage.teamSize')}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {TEAM_SIZES.map((size) => (
                      <Button
                        key={size.value}
                        onClick={() => setTeamSize(size.value)}
                        className={`rounded-xl border py-2 px-3 text-sm font-semibold transition-all ${
                          teamSize === size.value
                            ? 'border-primary-500 bg-primary-500/[0.06] text-primary-400'
                            : 'border-white/[0.08] text-white hover:border-white/[0.15]'
                        }`}
                      >
                        {size.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-white/50 mb-2">
                    {t('onboardingPage.workspaceUrl')}
                  </label>
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                    <input
                      type="text"
                      value={organizationSlug}
                      onChange={(e) => setOrganizationSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3.5 px-4 text-white placeholder-white/40 transition-all focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10 sm:flex-1"
                      placeholder="my-organization"
                    />
                    <span className="text-sm text-white/50 whitespace-nowrap">.onekof.com</span>
                  </div>
                  {organizationSlug && (
                    <p className="mt-2 text-xs text-primary-400">
                      {t('onboardingPage.yourWorkspace')} <strong>{organizationSlug}.onekof.com</strong>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Workspace Setup + Calendar */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div>
                  <label className="block text-[13px] font-medium text-white/50 mb-3">
                    {t('onboardingPage.calendarPreference')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setCalendarPreference('ethiopian')}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCalendarPreference('ethiopian'); } }}
                      className={`cursor-pointer rounded-xl border p-3 text-left transition-all ${
                        calendarPreference === 'ethiopian'
                          ? 'border-primary-500 bg-primary-500/[0.06] shadow-lg'
                          : 'border-white/[0.08] hover:border-white/[0.15]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Calendar className="h-4 w-4 text-primary-400" />
                        {calendarPreference === 'ethiopian' && (
                          <CheckCircle2 className="h-4 w-4 text-primary-400 ml-auto" />
                        )}
                      </div>
                      <div className="font-semibold text-white text-sm mb-0.5">{t('onboardingPage.ethiopian')}</div>
                      <div className="text-xs text-white/60">{'\u12E8\u12A2\u1275\u12EE\u1335\u12EB \u12D8\u1218\u1295 \u12A0\u1246\u1323\u1320\u122D'}</div>
                    </div>

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setCalendarPreference('gregorian')}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCalendarPreference('gregorian'); } }}
                      className={`cursor-pointer rounded-xl border p-3 text-left transition-all ${
                        calendarPreference === 'gregorian'
                          ? 'border-primary-500 bg-primary-500/[0.06] shadow-lg'
                          : 'border-white/[0.08] hover:border-white/[0.15]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Calendar className="h-4 w-4 text-white/60" />
                        {calendarPreference === 'gregorian' && (
                          <CheckCircle2 className="h-4 w-4 text-primary-400 ml-auto" />
                        )}
                      </div>
                      <div className="font-semibold text-white text-sm mb-0.5">{t('onboardingPage.gregorian')}</div>
                      <div className="text-xs text-white/60">{t('onboardingPage.international')}</div>
                    </div>

                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setCalendarPreference('both')}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCalendarPreference('both'); } }}
                      className={`cursor-pointer rounded-xl border p-3 text-left transition-all ${
                        calendarPreference === 'both'
                          ? 'border-primary-500 bg-primary-500/[0.06] shadow-lg'
                          : 'border-white/[0.08] hover:border-white/[0.15]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Globe className="h-4 w-4 text-purple-400" />
                        {calendarPreference === 'both' && (
                          <CheckCircle2 className="h-4 w-4 text-primary-400 ml-auto" />
                        )}
                      </div>
                      <div className="font-semibold text-white text-sm mb-0.5">{t('onboardingPage.both')}</div>
                      <div className="text-xs text-white/60">{t('onboardingPage.showBothCalendars')}</div>
                    </div>
                  </div>
                </div>

                {/* Mobile App Promo */}
                <div className="rounded-xl bg-gradient-to-br from-primary-500/[0.06] to-primary-700/[0.04] border border-primary-500/20 p-4 sm:p-6">
                  <div className="flex items-center gap-2.5 mb-4 sm:gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 sm:h-12 sm:w-12">
                      <Smartphone className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <div className="font-bold text-white">{t('onboardingPage.downloadMobileApp')}</div>
                      <div className="text-sm text-white/60">{t('onboardingPage.manageOnTheGo')}</div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a href="#" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/[0.06] border border-white/[0.08] px-4 py-2.5 text-sm text-white hover:bg-white/[0.08] transition-colors">
                      <span>App Store</span>
                    </a>
                    <a href="#" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/[0.06] border border-white/[0.08] px-4 py-2.5 text-sm text-white hover:bg-white/[0.08] transition-colors">
                      <span>Google Play</span>
                    </a>
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-xl bg-primary-500/[0.06] border border-primary-500/30 p-4 sm:p-6">
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <Sparkles className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-white mb-2">{t('onboardingPage.youreAllSet')}</p>
                      <p className="text-sm text-white/60 mb-3">
                        {t('onboardingPage.basedOnSelections')}{' '}
                        <strong className="text-white">{selectedOrgType?.label}</strong> {t('onboardingPage.organization')}.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedOrgType?.features.map((feature) => (
                          <span key={feature} className="text-xs bg-white/[0.06] text-primary-300 px-2 py-1 rounded border border-primary-500/30">
                            {feature}
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
              <Button variant="outline"
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#1B1F23] px-4 py-2.5 text-[13px] font-medium text-white/50 transition-all hover:bg-white/[0.04] hover:border-white/[0.15] sm:px-6 sm:py-3"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t('onboardingPage.back')}</span>
              </Button>
            )}

            {currentStep < totalSteps && !isPersonalWorkspace ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2)
                }
                className="ml-auto group relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 px-4 py-2.5 text-[13px] font-medium text-white/50 shadow-lg shadow-primary-500/20 transition-all hover:shadow-xl hover:shadow-primary-500/30 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary-500/30 disabled:opacity-50 disabled:hover:scale-100 sm:px-6 sm:py-3"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <div className="flex items-center gap-2">
                  <span>{t('onboardingPage.continue')}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="ml-auto group relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 px-4 py-2.5 text-[13px] font-medium text-white/50 shadow-lg shadow-primary-500/20 transition-all hover:shadow-xl hover:shadow-primary-500/30 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary-500/30 disabled:opacity-50 disabled:hover:scale-100 sm:px-6 sm:py-3"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('onboardingPage.creatingWorkspace')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{t('onboardingPage.launchWorkspace')}</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
              </Button>
            )}
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-white/50">
            &copy; 2026 Onekof &middot; {t('onboardingPage.builtForEthiopia')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#1B1F23]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}

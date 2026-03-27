'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap, Clock, Users, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trialEndsDate?: string;
}

export function PricingModal({ open, onOpenChange, trialEndsDate }: PricingModalProps) {
  const { t } = useLanguage();
  const plans = [
    {
      name: t('pricing.free'),
      price: '$0',
      period: t('pricing.perUserMonth'),
      description: t('pricing.forTeamsGettingStarted'),
      features: [
        t('pricing.upTo10Users'),
        t('pricing.basicPM'),
        t('pricing.ethCalendarLanguages'),
        t('pricing.communitySupport'),
      ],
      recommended: false,
      cta: t('pricing.selectFree'),
      ctaVariant: 'outline' as const,
      icon: '📦',
    },
    {
      name: t('pricing.standard'),
      price: '$5',
      period: t('pricing.perUserMonth'),
      description: t('pricing.forSmallGrowing'),
      features: [
        t('pricing.unlimitedUsers'),
        t('pricing.advancedPM'),
        t('pricing.projectUserPermissions'),
        t('pricing.advancedReporting'),
        t('pricing.prioritySupport'),
      ],
      recommended: true,
      cta: t('pricing.buyStandard'),
      ctaVariant: 'default' as const,
      icon: '🚀',
    },
    {
      name: t('pricing.premium'),
      price: '$10',
      period: t('pricing.perUserMonth'),
      description: t('pricing.forAIPoweredTeams'),
      badge: trialEndsDate ? `${getDaysLeft(trialEndsDate)} DAYS LEFT` : undefined,
      features: [
        t('pricing.aiTaskGeneration'),
        t('pricing.advancedPlanning'),
        t('pricing.support247'),
        t('pricing.advancedAdmin'),
        t('pricing.unlimitedStorage'),
      ],
      recommended: false,
      cta: t('pricing.addPayment'),
      ctaVariant: 'outline' as const,
      icon: '👑',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-[#1B1F23] border-slate-200 dark:border-slate-700 p-0 gap-0">
        {/* Header Section */}
        <div className="bg-white dark:bg-[#22272B] border-b border-slate-200 dark:border-slate-700 px-4 sm:px-8 py-4 sm:py-6">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-500 rounded-xl shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-bold text-slate-900 dark:text-white">
                  {t('pricing.choosePlan')}
                </DialogTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {t('pricing.selectPerfectPlan')}
                </p>
              </div>
            </div>

            {trialEndsDate && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-primary-500 rounded-r-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      {t('pricing.premiumTrialActive')}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {t('pricing.trialEndsOn')} <strong className="text-primary-600 dark:text-primary-400">{trialEndsDate}</strong>.
                      {t('pricing.choosePlanContinue')}{' '}
                      <a href="#" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 font-medium hover:underline">
                        {t('common.learnMore')} →
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogHeader>
        </div>

        {/* Pricing Cards Section */}
        <div className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl transition-all duration-300 ease-in-out ${
                  plan.recommended
                    ? 'bg-white dark:bg-[#22272B] shadow-xl border-2 border-primary-500 scale-105'
                    : 'bg-white dark:bg-[#22272B] shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-primary-400 hover:-translate-y-1'
                }`}
              >
                {/* Recommended Badge */}
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-primary-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wide">
                      {t('pricing.recommended')}
                    </div>
                  </div>
                )}

                {/* Trial Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 -right-2 z-10">
                    <div className="bg-jira-warning text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">{plan.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {plan.name}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 min-h-[40px]">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-400 mb-3">
                      {plans.indexOf(plan) === 0 ? t('pricing.whatsIncluded') : t('pricing.everythingInPlus').replace('{plan}', plans[plans.indexOf(plan) - 1]?.name || '')}
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-green-600 dark:text-green-500 stroke-[3]" />
                          </div>
                          <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Button
                    variant={plan.ctaVariant}
                    size="lg"
                    className={`w-full font-semibold transition-all duration-200 ${
                      plan.recommended
                        ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                        : 'border-2 border-slate-300 dark:border-slate-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-slate-700 hover:scale-105'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-slate-100 dark:bg-[#22272B] border-t border-slate-200 dark:border-slate-700 px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-400">
              <Users className="h-4 w-4" />
              <span>
                {t('pricing.needMore100Users')}{' '}
                <a href="#" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                  {t('pricing.exploreEnterprise')}
                </a>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-400">
              <MessageSquare className="h-4 w-4" />
              <span>
                {t('pricing.questions')}{' '}
                <a href="#" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                  {t('pricing.contactSales')}
                </a>
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getDaysLeft(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

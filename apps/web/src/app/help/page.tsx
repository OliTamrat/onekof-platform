'use client';

import { AppLayout } from '@/components/layouts/app-layout';
import { HelpCircle, BookOpen, Video, MessageCircle, Mail, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function HelpPage() {
  const { t } = useLanguage();

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{t('help.title')}</h1>
              <p className="text-sm text-gray-600 dark:text-slate-400">{t('help.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="#documentation"
                className="flex items-start gap-4 p-4 bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg hover:border-primary-500 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500/10 text-primary-500">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">{t('help.documentation')}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{t('help.documentationDesc')}</p>
                </div>
              </a>

              <a
                href="#tutorials"
                className="flex items-start gap-4 p-4 bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg hover:border-primary-500 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#F59E0B]/10 text-[#F59E0B]">
                  <Video className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">{t('help.videoTutorials')}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{t('help.videoTutorialsDesc')}</p>
                </div>
              </a>

              <a
                href="#community"
                className="flex items-start gap-4 p-4 bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg hover:border-primary-500 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#10B981]/10 text-[#10B981]">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">{t('help.communityForum')}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{t('help.communityForumDesc')}</p>
                </div>
              </a>

              <a
                href="mailto:support@onekof.com"
                className="flex items-start gap-4 p-4 bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg hover:border-primary-500 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#8B5CF6]/10 text-[#8B5CF6]">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">{t('help.contactSupport')}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{t('help.contactSupportDesc')}</p>
                </div>
              </a>
            </div>

            {/* FAQs */}
            <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('help.faq')}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t('help.faqCreateProject')}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{t('help.faqCreateProjectAnswer')}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t('help.faqInviteMembers')}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{t('help.faqInviteMembersAnswer')}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t('help.faqCustomizeDashboard')}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{t('help.faqCustomizeDashboardAnswer')}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{t('help.faqExportData')}</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{t('help.faqExportDataAnswer')}</p>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('help.additionalResources')}</h2>
              <div className="space-y-3">
                <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md transition-colors">
                  <span className="text-sm text-gray-900 dark:text-white">{t('help.gettingStartedGuide')}</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md transition-colors">
                  <span className="text-sm text-gray-900 dark:text-white">{t('help.apiDocumentation')}</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md transition-colors">
                  <span className="text-sm text-gray-900 dark:text-white">{t('keyboardShortcuts.title')}</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md transition-colors">
                  <span className="text-sm text-gray-900 dark:text-white">{t('help.releaseNotes')}</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

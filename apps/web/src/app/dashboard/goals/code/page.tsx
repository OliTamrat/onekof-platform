'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import {
  BarChart3,
  Book,
  Clock,
  Code,
  FileText,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Github,
  Gitlab as GitlabIcon,
  Plus,
  Target,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

export default function GoalsCodePage() {
  const { t } = useLanguage();
  const toast = useToast();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'github' | 'gitlab' | 'bitbucket' | null>(null);

  const TAB_ITEMS = [
    { id: 'summary', label: t('tabs.summary'), icon: BarChart3, href: '/dashboard/goals/summary' },
    { id: 'list', label: t('tabs.list'), icon: null, href: '/dashboard/goals/list' },
    { id: 'board', label: t('tabs.board'), icon: null, href: '/dashboard/goals/board' },
    { id: 'code', label: t('tabs.code'), icon: Code, href: '/dashboard/goals/code', active: true },
    { id: 'forms', label: t('tabs.forms'), icon: FileText, href: '/dashboard/goals/forms' },
    { id: 'timeline', label: t('tabs.timeline'), icon: Clock, href: '/dashboard/goals/timeline' },
    { id: 'pages', label: t('tabs.pages'), icon: Book, href: '/dashboard/goals/pages' },
  ];

  const handleConnect = () => {
    if (selectedProvider) {
      console.log('Connecting to:', selectedProvider);
      toast.info(t('codeConnect.connecting'), t('codeConnect.redirectingOAuth', { provider: selectedProvider }));
      setShowConnectModal(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#0B0E11]">
        <div className="border-b border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/[0.08] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                <Code className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">{t('tabs.code')}</h1>
            </div>
            <Button
              onClick={() => setShowConnectModal(true)}
              className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600"
            >
              <Plus className="h-4 w-4" />
              {t('codeConnect.title')}
            </Button>
          </div>

          <div className="flex items-center gap-1 px-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link key={tab.id} href={tab.href} className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${tab.active ? 'border-primary-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white'}`}>
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-[#181D23] rounded-full flex items-center justify-center mb-4">
              <GitBranch className="h-8 w-8 text-gray-400 dark:text-[#6B7684]" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{t('codeConnect.connectReposTrackGoals')}</h2>
            <p className="text-gray-600 dark:text-white/50 mb-6">{t('codeConnect.goalsDescription')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-6 bg-white dark:bg-[#12161B] rounded-lg border border-gray-200 dark:border-white/[0.08]">
                <GitCommit className="h-8 w-8 text-primary-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('codeConnect.commitTracking')}</h3>
                <p className="text-sm text-gray-600 dark:text-white/50">{t('codeConnect.commitTrackingDesc')}</p>
              </div>
              <div className="p-6 bg-white dark:bg-[#12161B] rounded-lg border border-gray-200 dark:border-white/[0.08]">
                <GitPullRequest className="h-8 w-8 text-primary-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('codeConnect.prProgress')}</h3>
                <p className="text-sm text-gray-600 dark:text-white/50">{t('codeConnect.prProgressDesc')}</p>
              </div>
              <div className="p-6 bg-white dark:bg-[#12161B] rounded-lg border border-gray-200 dark:border-white/[0.08]">
                <Target className="h-8 w-8 text-primary-500 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('codeConnect.milestoneSync')}</h3>
                <p className="text-sm text-gray-600 dark:text-white/50">{t('codeConnect.milestoneSyncDesc')}</p>
              </div>
            </div>
            <Button
              onClick={() => setShowConnectModal(true)}
              className="mt-8 flex items-center gap-2 mx-auto rounded-md bg-primary-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-600"
            >
              <Plus className="h-4 w-4" />
              {t('codeConnect.title')}
            </Button>
          </div>
        </div>

        {/* Repository Connection Modal */}
        {showConnectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#12161B] rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/[0.08]">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('codeConnect.title')}</h2>
                <Button onClick={() => setShowConnectModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600 dark:text-white/50">
                  {t('codeConnect.chooseProviderGoals')}
                </p>

                <div className="space-y-3">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedProvider('github')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedProvider('github'); } }}
                    className={`w-full cursor-pointer flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                      selectedProvider === 'github'
                        ? 'border-primary-500 bg-primary-500/5'
                        : 'border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-[#3C434A]'
                    }`}
                  >
                    <Github className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-white">GitHub</div>
                      <div className="text-xs text-gray-600 dark:text-white/50">{t('codeConnect.connectGitHubGoals')}</div>
                    </div>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedProvider('gitlab')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedProvider('gitlab'); } }}
                    className={`w-full cursor-pointer flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                      selectedProvider === 'gitlab'
                        ? 'border-primary-500 bg-primary-500/5'
                        : 'border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-[#3C434A]'
                    }`}
                  >
                    <GitlabIcon className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-white">GitLab</div>
                      <div className="text-xs text-gray-600 dark:text-white/50">{t('codeConnect.connectGitLabGoals')}</div>
                    </div>
                  </div>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedProvider('bitbucket')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedProvider('bitbucket'); } }}
                    className={`w-full cursor-pointer flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                      selectedProvider === 'bitbucket'
                        ? 'border-primary-500 bg-primary-500/5'
                        : 'border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-[#3C434A]'
                    }`}
                  >
                    <GitBranch className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-white">Bitbucket</div>
                      <div className="text-xs text-gray-600 dark:text-white/50">{t('codeConnect.connectBitbucketGoals')}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-white/[0.08]">
                <Button
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#181D23] rounded-md"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleConnect}
                  disabled={!selectedProvider}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('codeConnect.connect')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

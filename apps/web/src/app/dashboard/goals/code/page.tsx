'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import { Plus, GitBranch, GitCommit, GitPullRequest, Code, BarChart3, FileText, Clock, Book, X, Github, GitlabIcon as Gitlab, Target } from 'lucide-react';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/goals/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/goals/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/goals/board' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/goals/code', active: true },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/goals/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/goals/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/goals/pages' },
] as const;

export default function GoalsCodePage() {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'github' | 'gitlab' | 'bitbucket' | null>(null);

  const handleConnect = () => {
    if (selectedProvider) {
      console.log('Connecting to:', selectedProvider);
      alert(`Connecting to ${selectedProvider}... This would redirect to OAuth flow in production.`);
      setShowConnectModal(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        <div className="border-b border-gray-200 dark:border-[#2C333A] bg-white dark:bg-[#22272B]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2C333A] px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0065FF] text-white font-semibold">
                <Code className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">Code</h1>
            </div>
            <button
              onClick={() => setShowConnectModal(true)}
              className="flex items-center gap-2 rounded-md bg-[#0065FF] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0052CC]"
            >
              <Plus className="h-4 w-4" />
              Connect Repository
            </button>
          </div>

          <div className="flex items-center gap-1 px-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link key={tab.id} href={tab.href} className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${tab.active ? 'border-[#0065FF] text-gray-900 dark:text-white' : 'border-transparent text-gray-600 dark:text-[#9FADBC] hover:text-gray-900 dark:hover:text-white'}`}>
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-[#282E33] rounded-full flex items-center justify-center mb-4">
              <GitBranch className="h-8 w-8 text-gray-400 dark:text-[#6B7684]" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Connect repositories to track goal progress</h2>
            <p className="text-gray-600 dark:text-[#9FADBC] mb-6">Link code repositories to automatically track development progress toward your goals.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-6 bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-[#2C333A]">
                <GitCommit className="h-8 w-8 text-[#0065FF] mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Commit Tracking</h3>
                <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Track commits linked to goal milestones</p>
              </div>
              <div className="p-6 bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-[#2C333A]">
                <GitPullRequest className="h-8 w-8 text-[#0065FF] mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">PR Progress</h3>
                <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Monitor pull requests for goal deliverables</p>
              </div>
              <div className="p-6 bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-[#2C333A]">
                <Target className="h-8 w-8 text-[#0065FF] mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Milestone Sync</h3>
                <p className="text-sm text-gray-600 dark:text-[#9FADBC]">Sync code milestones with goal tracking</p>
              </div>
            </div>
            <button
              onClick={() => setShowConnectModal(true)}
              className="mt-8 flex items-center gap-2 mx-auto rounded-md bg-[#0065FF] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0052CC]"
            >
              <Plus className="h-4 w-4" />
              Connect Repository
            </button>
          </div>
        </div>

        {/* Repository Connection Modal */}
        {showConnectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#22272B] rounded-lg shadow-xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2C333A]">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Connect Repository</h2>
                <button onClick={() => setShowConnectModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600 dark:text-[#9FADBC]">
                  Choose your code hosting provider to track goal progress
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedProvider('github')}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                      selectedProvider === 'github'
                        ? 'border-[#0065FF] bg-[#0065FF]/5'
                        : 'border-gray-200 dark:border-[#2C333A] hover:border-gray-300 dark:hover:border-[#3C434A]'
                    }`}
                  >
                    <Github className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-white">GitHub</div>
                      <div className="text-xs text-gray-600 dark:text-[#9FADBC]">Connect GitHub repositories</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedProvider('gitlab')}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                      selectedProvider === 'gitlab'
                        ? 'border-[#0065FF] bg-[#0065FF]/5'
                        : 'border-gray-200 dark:border-[#2C333A] hover:border-gray-300 dark:hover:border-[#3C434A]'
                    }`}
                  >
                    <Gitlab className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-white">GitLab</div>
                      <div className="text-xs text-gray-600 dark:text-[#9FADBC]">Connect GitLab repositories</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedProvider('bitbucket')}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                      selectedProvider === 'bitbucket'
                        ? 'border-[#0065FF] bg-[#0065FF]/5'
                        : 'border-gray-200 dark:border-[#2C333A] hover:border-gray-300 dark:hover:border-[#3C434A]'
                    }`}
                  >
                    <GitBranch className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-white">Bitbucket</div>
                      <div className="text-xs text-gray-600 dark:text-[#9FADBC]">Connect Bitbucket repositories</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-[#2C333A]">
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#282E33] rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnect}
                  disabled={!selectedProvider}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0065FF] hover:bg-[#0052CC] rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Connect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

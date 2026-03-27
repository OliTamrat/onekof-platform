'use client';

import { AppLayout } from '@/components/layouts/app-layout';
import Link from 'next/link';
import {
  BarChart3,
  Book,
  Clock,
  Code,
  File,
  FileText,
  Folder,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

const TAB_ITEMS = [
  { id: 'summary', label: 'Summary', icon: BarChart3, href: '/dashboard/projects/summary' },
  { id: 'list', label: 'List', icon: null, href: '/dashboard/projects/list' },
  { id: 'board', label: 'Board', icon: null, href: '/dashboard/projects/board' },
  { id: 'code', label: 'Code', icon: Code, href: '/dashboard/projects/code' },
  { id: 'forms', label: 'Forms', icon: FileText, href: '/dashboard/projects/forms' },
  { id: 'timeline', label: 'Timeline', icon: Clock, href: '/dashboard/projects/timeline' },
  { id: 'pages', label: 'Pages', icon: Book, href: '/dashboard/projects/pages', active: true },
];

export default function ProjectsPagesPage() {
  const { t } = useLanguage();
  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B]">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-500 text-white font-semibold">
                <Book className="h-5 w-5" />
              </div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">{t("projectPages.title")}</h1>
            </div>
            <Button className="flex items-center gap-2 rounded-md bg-primary-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-600">
              <Plus className="h-4 w-4" />
              {t("projectPages.createPage")}
            </Button>
          </div>
          <div className="flex items-center gap-1 px-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link key={tab.id} href={tab.href} className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${tab.active ? 'border-primary-500 text-gray-900 dark:text-white' : 'border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}>
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
              <Book className="h-8 w-8 text-gray-400 dark:text-[#6B7684]" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{t("projectPages.projectDocumentation")}</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-6">{t("projectPages.projectDocumentationDesc")}</p>
            <div className="grid grid-cols-1 gap-4 mt-8 max-w-md mx-auto">
              <div className="p-4 bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-slate-700 text-left hover:border-primary-500 cursor-pointer transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                    <File className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t("projectPages.blankPage")}</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{t("projectPages.blankPageDesc")}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-slate-700 text-left hover:border-primary-500 cursor-pointer transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t("projectPages.projectBrief")}</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{t("projectPages.projectBriefDesc")}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-[#22272B] rounded-lg border border-gray-200 dark:border-slate-700 text-left hover:border-primary-500 cursor-pointer transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
                    <Folder className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t("projectPages.technicalSpec")}</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{t("projectPages.technicalSpecDesc")}</p>
                  </div>
                </div>
              </div>
            </div>
            <Button className="mt-8 flex items-center gap-2 mx-auto rounded-md bg-primary-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-600">
              <Plus className="h-4 w-4" />
              {t("projectPages.createYourFirstPage")}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

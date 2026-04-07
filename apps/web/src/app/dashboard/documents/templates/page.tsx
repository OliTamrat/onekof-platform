'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { DOCUMENTS_TABS } from '@/config/department-tabs';
import { FileText, Sparkles, Loader2, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  uploadedBy?: { name: string | null; email: string };
}

export default function DocumentsTemplatesPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard/documents/templates');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchDocuments();
    }
  }, [session]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/documents?fileType=template');
      if (!response.ok) {
        throw new Error('Failed to load templates');
      }
      const data = await response.json();
      setDocuments(data.documents ?? []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setError(t('documents.loadError'));
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('documents.templates')}
        icon={<FileText className="h-6 w-6" />}
        iconColor="#1C8C7D"
        currentTab="templates"
        baseHref="/dashboard/documents"
        showTabs
        customTabs={DOCUMENTS_TABS}
      />
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-[#1C8C7D] animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 mx-auto text-slate-400 mb-3" />
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            <button
              onClick={fetchDocuments}
              className="mt-3 text-sm text-[#1C8C7D] hover:underline"
            >
              {t('common.refresh')}
            </button>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 mx-auto text-slate-400 mb-3" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('documents.noTemplates')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg hover:border-[#1C8C7D] dark:hover:border-[#1C8C7D] transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/20">
                    <Sparkles className="h-5 w-5 text-[#1C8C7D]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">
                      {doc.title || doc.fileName}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mb-2">
                      {doc.fileType}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {formatDate(doc.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

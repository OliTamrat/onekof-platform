'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { DOCUMENTS_TABS } from '@/config/department-tabs';
import { Clock, FileText, User, Loader2 } from 'lucide-react';
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

export default function DocumentsRecentPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard/documents/recent');
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
      const response = await fetch(
        '/api/documents?orderBy=createdAt&order=desc&limit=20',
      );
      if (!response.ok) {
        throw new Error('Failed to load documents');
      }
      const data = await response.json();
      setDocuments(data.documents ?? []);
    } catch (err) {
      console.error('Failed to fetch recent documents:', err);
      setError(t('documents.loadError'));
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('documents.recentDocuments')}
        icon={<Clock className="h-6 w-6" />}
        iconColor="#1C8C7D"
        currentTab="recent"
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
            <Clock className="h-12 w-12 mx-auto text-slate-400 mb-3" />
            <p className="text-sm text-slate-600 dark:text-white/50">
              {t('documents.noDocuments')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-4 hover:shadow-lg hover:border-[#1C8C7D] dark:hover:border-[#1C8C7D] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#1C8C7D] flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {doc.title || doc.fileName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-white/50 mt-1">
                        <span>{doc.fileType}</span>
                        {doc.uploadedBy && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {doc.uploadedBy.name ?? doc.uploadedBy.email}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-white/50 flex-shrink-0">
                    {formatRelativeTime(doc.updatedAt)}
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

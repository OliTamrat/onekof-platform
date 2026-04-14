'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { DOCUMENTS_TABS } from '@/config/department-tabs';
import { Users, FileText, User, Loader2, Calendar } from 'lucide-react';
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

export default function DocumentsSharedPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard/documents/shared');
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
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('Failed to load documents');
      }
      const data = await response.json();
      setDocuments(data.documents ?? []);
    } catch (err) {
      console.error('Failed to fetch shared documents:', err);
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
        title={t('documents.sharedDocuments')}
        icon={<Users className="h-6 w-6" />}
        iconColor="#1C8C7D"
        currentTab="shared"
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
            <Users className="h-12 w-12 mx-auto text-slate-400 mb-3" />
            <p className="text-sm text-slate-600 dark:text-white/50">
              {t('documents.noSharedDocuments')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-4 hover:shadow-lg hover:border-[#1C8C7D] dark:hover:border-[#1C8C7D] transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-[#1C8C7D] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 truncate">
                      {doc.title || doc.fileName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-white/50">
                      {doc.uploadedBy && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {t('documents.sharedBy')} {doc.uploadedBy.name ?? doc.uploadedBy.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(doc.createdAt)}
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400">
                        {doc.fileType}
                      </span>
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

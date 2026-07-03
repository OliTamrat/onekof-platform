'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { DOCUMENTS_TABS } from '@/config/department-tabs';
import { Sparkles, Search, FileText, Calendar, User, Loader2 } from 'lucide-react';
import { SlideoutPanel, SlideoutPanelContent, SlideoutPanelSection } from '@/components/ui/slideout-panel';
import { Button } from '@/components/ui/button';
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

export default function DocumentsAllPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard/documents/all');
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
      console.error('Failed to fetch documents:', err);
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

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const filteredDocs = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('documents.allDocuments')}
        icon={<Sparkles className="h-6 w-6" />}
        iconColor="#1C8C7D"
        currentTab="all"
        baseHref="/dashboard/documents"
        showTabs
        customTabs={DOCUMENTS_TABS}
      />
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('documents.searchDocuments')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-white/[0.08] rounded-md bg-white dark:bg-[#0B0E11] text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1C8C7D]"
            />
          </div>
          <Button
            className="flex items-center gap-2 rounded-md bg-[#1C8C7D] px-4 py-2 text-sm font-medium text-white hover:bg-[#17756A]"
            onClick={() => router.push('/dashboard/documents')}
          >
            <Sparkles className="h-4 w-4" />
            {t('documents.newDocument')}
          </Button>
        </div>

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
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 mx-auto text-slate-400 mb-3" />
            <p className="text-sm text-slate-600 dark:text-white/70">
              {searchQuery ? t('common.noResults') : t('documents.noDocuments')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => {
                  setSelectedDoc(doc);
                  setIsSlideoutOpen(true);
                }}
                className="bg-white dark:bg-[#12161B] border border-gray-200 dark:border-white/[0.08] rounded-lg p-4 hover:shadow-lg hover:border-[#1C8C7D] dark:hover:border-[#1C8C7D] transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-3">
                  <FileText className="h-5 w-5 text-[#1C8C7D] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">
                      {doc.title || doc.fileName}
                    </h3>
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400">
                      {doc.fileType}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-gray-600 dark:text-white/70">
                  {doc.uploadedBy && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {doc.uploadedBy.name ?? doc.uploadedBy.email}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(doc.createdAt)}
                  </div>
                  <div>{formatSize(doc.fileSize)}</div>
                </div>
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {doc.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-white/[0.08] text-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <SlideoutPanel
        isOpen={isSlideoutOpen}
        onClose={() => setIsSlideoutOpen(false)}
        title={selectedDoc?.title || selectedDoc?.fileName || t('documents.documentDetails')}
      >
        <SlideoutPanelContent>
          <SlideoutPanelSection title={t('documents.documentInformation')}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('common.type')}
                </label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedDoc?.fileType}</p>
              </div>
              {selectedDoc?.uploadedBy && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('common.createdBy')}
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {selectedDoc.uploadedBy.name ?? selectedDoc.uploadedBy.email}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('common.createdDate')}
                </label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {selectedDoc ? formatDate(selectedDoc.createdAt) : ''}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('common.size')}
                </label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {selectedDoc ? formatSize(selectedDoc.fileSize) : ''}
                </p>
              </div>
              {selectedDoc && selectedDoc.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('common.tags')}
                  </label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedDoc.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-white/[0.08] text-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SlideoutPanelSection>
        </SlideoutPanelContent>
      </SlideoutPanel>
    </AppLayout>
  );
}

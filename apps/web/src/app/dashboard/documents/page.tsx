'use client';

/**
 * AI Documents Page
 * View all uploaded documents with AI insights
 */

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import { AppLayout } from '@/components/layouts/app-layout';
import { DocumentUpload } from '@/components/documents/document-upload';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { DOCUMENTS_TABS } from '@/config/department-tabs';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  Eye,
  Loader2,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function DocumentsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { currentOrganization } = useWorkspace();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard/documents');
    }
  }, [status, router]);

  // Fetch documents + poll while any are PROCESSING
  useEffect(() => {
    if (session) {
      fetchDocuments();
    }
  }, [session]);

  useEffect(() => {
    const hasProcessing = documents.some((d: any) => d.status === 'PROCESSING');
    if (!hasProcessing) return;
    const interval = setInterval(() => {
      fetch('/api/documents').then(r => r.ok ? r.json() : null).then(data => {
        if (data?.documents) setDocuments(data.documents);
      }).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [documents]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle upload complete
  const handleUploadComplete = () => {
    fetchDocuments();
  };

  // Handle document delete
  const handleDelete = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (response.ok) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  // Handle document retry
  const handleRetry = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    try {
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'PROCESSING' } : d));
      const response = await fetch(`/api/documents/${docId}/retry`, { method: 'POST' });
      if (response.ok) {
        fetchDocuments();
      } else {
        setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'FAILED' } : d));
      }
    } catch (error) {
      console.error('Failed to retry document:', error);
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'FAILED' } : d));
    }
  };

  // Don't render if not authenticated
  if (!session) {
    return null;
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get document type color
  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'invoice':
      case 'receipt':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'contract':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'proposal':
      case 'rfp':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      default:
        return 'bg-slate-100 dark:bg-[#181D23] text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('documents.aiTitle')}
        icon={<Sparkles className="h-6 w-6" />}
        iconColor="#1C8C7D"
        currentTab="documents"
        baseHref="/dashboard/documents"
        customTabs={DOCUMENTS_TABS}
        showTabs
        showSearch
        showFilters
        showGroupBy={false}
        showViewSettings
        showInsights={false}
      />

      <div className="p-3 md:p-6 space-y-6">

        {/* Upload Component */}
        <DocumentUpload onUploadComplete={handleUploadComplete} />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {documents.length}
                </p>
                <p className="text-xs text-slate-500 dark:text-white/70">{t('documents.totalDocuments')}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {documents.filter((d) => d.status === 'COMPLETED').length}
                </p>
                <p className="text-xs text-slate-500 dark:text-white/70">{t('documents.processed')}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {documents.filter((d) => d.status === 'PROCESSING').length}
                </p>
                <p className="text-xs text-slate-500 dark:text-white/70">{t('documents.processing')}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {documents.reduce((sum, d) => sum + (d.budgetItems || 0), 0)}
                </p>
                <p className="text-xs text-slate-500 dark:text-white/70">{t('documents.budgetItemsExtracted')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#12161B]">
          <div className="p-6 border-b border-slate-200 dark:border-white/[0.08]">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('documents.yourDocuments')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-white/70 mt-1">
              {t('documents.yourDocumentsDesc')}
            </p>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-[#1C8C7D] animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                <p className="text-slate-600 dark:text-white/70">
                  {t('documents.noDocuments')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="relative p-4 rounded-lg border border-slate-200 dark:border-white/[0.08] hover:border-[#1C8C7D] dark:hover:border-[#1C8C7D] transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedDocument(doc)}
                  >
                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDelete(e, doc.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors z-10"
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex items-start gap-4 pr-8">
                      {/* Status Icon */}
                      <div className={`
                        flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center
                        ${doc.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30' :
                          doc.status === 'PROCESSING' ? 'bg-orange-100 dark:bg-orange-900/30' :
                          doc.status === 'FAILED' ? 'bg-red-100 dark:bg-red-900/30' :
                          'bg-slate-100 dark:bg-[#181D23]'}
                      `}>
                        {doc.status === 'PROCESSING' ? (
                          <Loader2 className="h-6 w-6 text-orange-600 dark:text-orange-400 animate-spin" />
                        ) : doc.status === 'COMPLETED' ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                        ) : doc.status === 'FAILED' ? (
                          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        ) : (
                          <Clock className="h-6 w-6 text-slate-600 dark:text-white/70" />
                        )}
                      </div>

                      {/* Document Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                              {doc.fileName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getDocumentTypeColor(doc.fileType)}`}>
                                {doc.fileType}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-white/70">
                                • {(doc.fileSize / 1024).toFixed(0)} KB
                              </span>
                              <span className="text-xs text-slate-500 dark:text-white/70">
                                • {formatDate(doc.uploadedAt)}
                              </span>
                            </div>
                          </div>

                          {doc.aiConfidence && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#1C8C7D]/10 border border-[#1C8C7D]/20">
                              <Sparkles className="h-3 w-3 text-[#1C8C7D]" />
                              <span className="text-xs font-medium text-[#1C8C7D]">
                                {(doc.aiConfidence * 100).toFixed(0)}{t('documents.confidence')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* AI Summary */}
                        {doc.aiSummary && (
                          <p className="text-sm text-slate-600 dark:text-white/70 mb-3 line-clamp-2">
                            {doc.aiSummary}
                          </p>
                        )}

                        {/* Extracted Items */}
                        {doc.status === 'COMPLETED' && (
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-white/70">
                            {doc.budgetItems > 0 && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3.5 w-3.5" />
                                <span>{doc.budgetItems} {t('documents.budgetItems')}</span>
                              </div>
                            )}
                            {doc.milestones > 0 && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{doc.milestones} {t('documents.milestones')}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 ml-auto">
                              <Eye className="h-3.5 w-3.5 text-[#1C8C7D]" />
                              <span className="text-[#1C8C7D] font-medium">{t('documents.viewDetails')}</span>
                            </div>
                          </div>
                        )}

                        {doc.status === 'PROCESSING' && (
                          <p className="text-xs text-orange-600 dark:text-orange-400">
                            {t('documents.analyzing')}
                          </p>
                        )}

                        {doc.status === 'FAILED' && (
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-red-600 dark:text-red-400">
                              {t('documents.processingFailed')}
                            </p>
                            <button
                              onClick={(e) => handleRetry(e, doc.id)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Retry
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

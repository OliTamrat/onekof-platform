'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Save,
  Pencil,
  Eye,
  Clock,
  Tag,
  Loader2,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
  } | null;
}

export default function ArticlePage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;

  const [article, setArticle] = useState<WikiArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/wiki/articles/${articleId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('not_found');
        } else {
          setError('fetch_error');
        }
        return;
      }
      const data = await res.json();
      setArticle(data);
      setTitle(data.title);
      setContent(data.content);
    } catch {
      setError('fetch_error');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const handleSave = async () => {
    if (!article) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/wiki/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (res.ok) {
        const updated = await res.json();
        setArticle(updated);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!article || !confirm(t('common.confirmDelete'))) return;
    const res = await fetch(`/api/wiki/articles/${article.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/dashboard/wiki');
    }
  };

  const handlePublish = async () => {
    if (!article) return;
    const res = await fetch(`/api/wiki/articles/${article.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: article.status === 'published' ? 'draft' : 'published' }),
    });
    if (res.ok) {
      const updated = await res.json();
      setArticle(updated);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1C8C7D]" />
        </div>
      </AppLayout>
    );
  }

  if (error || !article) {
    return (
      <AppLayout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-[#282E33]">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              {error === 'not_found' ? t('wiki.articleNotFound') : t('common.error')}
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
              {error === 'not_found' ? t('wiki.articleNotFoundDesc') : t('wiki.fetchError')}
            </p>
            <Button
              onClick={() => router.push('/dashboard/wiki')}
              className="mt-4 bg-[#1C8C7D] hover:bg-[#167A6E] text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('wiki.backToWiki')}
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const formattedDate = new Date(article.updatedAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <AppLayout>
      <div className="flex h-full flex-col bg-gray-50 dark:bg-[#1B1F23]">
        {/* Top bar */}
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-[#22272B] px-3 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => router.push('/dashboard/wiki')}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-[#1C8C7D] transition-colors shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('wiki.backToWiki')}
              </button>
              {article.category && (
                <>
                  <span className="text-gray-300 dark:text-slate-600">/</span>
                  <span
                    className="rounded-md px-2 py-0.5 text-xs font-medium shrink-0"
                    style={{ backgroundColor: article.category.color + '20', color: article.category.color }}
                  >
                    {article.category.name}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Status badge */}
              <span className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                article.status === 'published'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              )}>
                {article.status === 'published' ? t('wiki.published') : t('wiki.draft')}
              </span>

              {editing ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setEditing(false); setTitle(article.title); setContent(article.content); }}
                    className="text-gray-600 dark:text-slate-400"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-1.5 bg-[#1C8C7D] hover:bg-[#167A6E] text-white"
                  >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    {t('common.save')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(true)}
                    className="gap-1.5 text-gray-600 dark:text-slate-400 hover:text-[#1C8C7D]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t('common.edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePublish}
                    className="gap-1.5 text-gray-600 dark:text-slate-400"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {article.status === 'published' ? t('wiki.unpublish') : t('wiki.publish')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Article content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
            {/* Title */}
            {editing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-slate-600 mb-4"
                placeholder={t('wiki.untitledArticle')}
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {article.title}
              </h1>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{t('wiki.lastUpdated')} {formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                <span>{article.viewCount} {t('wiki.views')}</span>
              </div>
              {article.category && (
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  <span>{article.category.name}</span>
                </div>
              )}
            </div>

            {/* Content area */}
            {editing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[500px] text-base leading-relaxed text-gray-700 dark:text-slate-300 bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-4 resize-y outline-none focus:border-[#1C8C7D] focus:ring-1 focus:ring-[#1C8C7D] transition-colors"
                placeholder={t('wiki.startWriting')}
              />
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-slate-300 leading-relaxed">
                {article.content ? (
                  article.content.split('\n').map((paragraph, i) => {
                    if (!paragraph.trim()) return <br key={i} />;
                    // Basic markdown heading support
                    if (paragraph.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-2">{paragraph.slice(4)}</h3>;
                    if (paragraph.startsWith('## ')) return <h2 key={i} className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">{paragraph.slice(3)}</h2>;
                    if (paragraph.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-3">{paragraph.slice(2)}</h1>;
                    if (paragraph.startsWith('- ')) return <li key={i} className="ml-4">{paragraph.slice(2)}</li>;
                    return <p key={i} className="mb-3">{paragraph}</p>;
                  })
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-10 w-10 text-gray-300 dark:text-slate-600 mb-3" />
                    <p className="text-gray-400 dark:text-slate-500">{t('wiki.emptyArticle')}</p>
                    <Button
                      onClick={() => setEditing(true)}
                      className="mt-3 gap-1.5 bg-[#1C8C7D] hover:bg-[#167A6E] text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {t('wiki.startEditing')}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

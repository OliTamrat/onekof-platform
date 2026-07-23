'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Settings, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { t } = useLanguage();

  const [project, setProject] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => setProject(data.project || data))
      .catch(() => {});
  }, [projectId]);

  const handleDelete = async () => {
    if (confirmText !== project?.name) return;
    setIsDeleting(true);
    setError('');

    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete project');
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-full overflow-y-auto bg-gray-50 dark:bg-[#1B1F23] p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Project Settings</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage project configuration and danger zone actions
          </p>
        </div>

        {/* Project Info */}
        {project && (
          <div className="mb-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#282E33] p-6">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Project Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Name</span>
                <span className="font-medium text-gray-900 dark:text-white">{project.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Key</span>
                <span className="font-mono text-gray-900 dark:text-white">{project.key}</span>
              </div>
              {project.description && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Description</span>
                  <span className="text-gray-900 dark:text-white max-w-[60%] text-right">{project.description}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="text-sm font-semibold text-red-700 dark:text-red-400">Danger Zone</h2>
          </div>

          <div className="rounded-lg border border-red-200 dark:border-red-900/30 bg-white dark:bg-[#282E33] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Delete this project</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Once deleted, the project and all its issues, documents, and data will be moved to trash.
                  Projects can be recovered within 30 days.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>

          {showDeleteConfirm && (
            <div className="mt-4 rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-[#1B1F23] p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Type <strong className="text-red-600 dark:text-red-400">{project?.name}</strong> to confirm deletion:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={project?.name}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#282E33] px-3 py-2 text-sm text-gray-900 dark:text-white mb-3 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
              />
              {error && (
                <p className="text-xs text-red-500 mb-3">{error}</p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={confirmText !== project?.name || isDeleting}
                  onClick={handleDelete}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'I understand, delete this project'
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowDeleteConfirm(false); setConfirmText(''); setError(''); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

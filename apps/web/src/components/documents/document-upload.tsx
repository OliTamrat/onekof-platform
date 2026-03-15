'use client';

/**
 * AI-Powered Document Upload Component
 * Drag-and-drop interface for uploading documents with Claude AI processing
 */

import { useState, useCallback } from 'react';
import { Upload, FileText, Sparkles, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';

interface DocumentUploadProps {
  projectId?: string;
  budgetId?: string;
  onUploadComplete?: (document: any) => void;
}

export function DocumentUpload({
  projectId,
  budgetId,
  onUploadComplete,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    [key: string]: 'uploading' | 'processing' | 'success' | 'error';
  }>({});
  const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>({});

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  // Handle file input change
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  // Remove file from list
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload files
  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);

    for (const file of files) {
      const fileKey = `${file.name}-${file.size}`;
      setUploadStatus((prev) => ({ ...prev, [fileKey]: 'uploading' }));

      try {
        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        if (projectId) formData.append('projectId', projectId);
        if (budgetId) formData.append('budgetId', budgetId);

        // Upload file
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const result = await response.json();

        setUploadStatus((prev) => ({ ...prev, [fileKey]: 'processing' }));

        // Simulate AI processing time (in real scenario, poll for status or use websocket)
        setTimeout(() => {
          setUploadStatus((prev) => ({ ...prev, [fileKey]: 'success' }));
          onUploadComplete?.(result.document);
        }, 3000);
      } catch (error) {
        console.error('Upload error:', error);
        setUploadStatus((prev) => ({ ...prev, [fileKey]: 'error' }));
        setUploadErrors((prev) => ({
          ...prev,
          [fileKey]: error instanceof Error ? error.message : 'Upload failed',
        }));
      }
    }

    setUploading(false);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-12 transition-all duration-200
          ${isDragging
            ? 'border-[#1C8C7D] bg-[#1C8C7D]/5 dark:bg-[#1C8C7D]/10'
            : 'border-slate-300 dark:border-slate-700 hover:border-[#1C8C7D] dark:hover:border-[#1C8C7D]'
          }
        `}
      >
        <div className="text-center">
          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#1C8C7D] to-[#16A085] flex items-center justify-center">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Upload Documents for AI Analysis
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Drag and drop files here, or click to browse
          </p>

          {/* File Types */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">Invoices</span>
            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">Receipts</span>
            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">Contracts</span>
            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">Proposals</span>
            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">RFPs</span>
            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">Reports</span>
          </div>

          {/* Browse Button */}
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C8C7D] text-white rounded-lg font-medium cursor-pointer hover:bg-[#156B60] transition-colors">
            <FileText className="h-4 w-4" />
            Browse Files
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          {/* Supported Formats */}
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Supported: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
          </p>
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Files to Upload ({files.length})
            </h4>
            {!uploading && (
              <button
                onClick={() => setFiles([])}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-2">
            {files.map((file, index) => {
              const fileKey = `${file.name}-${file.size}`;
              const status = uploadStatus[fileKey];
              const error = uploadErrors[fileKey];

              return (
                <div
                  key={fileKey}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#22272B]"
                >
                  {/* File Icon */}
                  <div className={`
                    flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center
                    ${status === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                      status === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                      'bg-slate-100 dark:bg-slate-800'}
                  `}>
                    {status === 'uploading' || status === 'processing' ? (
                      <Loader2 className="h-5 w-5 text-[#1C8C7D] animate-spin" />
                    ) : status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : status === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(file.size)}
                      {status === 'processing' && (
                        <span className="ml-2 text-[#1C8C7D]">• AI processing...</span>
                      )}
                      {status === 'success' && (
                        <span className="ml-2 text-green-600 dark:text-green-400">• Complete</span>
                      )}
                      {error && (
                        <span className="ml-2 text-red-600 dark:text-red-400">• {error}</span>
                      )}
                    </p>
                  </div>

                  {/* Remove Button */}
                  {!status && !uploading && (
                    <button
                      onClick={() => removeFile(index)}
                      className="flex-shrink-0 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && !uploading && (
        <button
          onClick={handleUpload}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1C8C7D] to-[#16A085] text-white rounded-lg font-medium hover:from-[#156B60] hover:to-[#128A75] transition-all duration-200"
        >
          <Sparkles className="h-4 w-4" />
          Upload & Process with AI
        </button>
      )}

      {/* AI Processing Info */}
      {uploading && (
        <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-start gap-3">
            <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                AI Processing in Progress
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Claude AI is analyzing your documents for key insights, budget items, and milestones...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

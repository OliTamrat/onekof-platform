import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200 dark:bg-slate-700/50',
        className
      )}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-md border border-slate-200 bg-white p-4 dark:border-white/[0.08] dark:bg-[#22272B]',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={cn('rounded-md border border-slate-200 dark:border-white/[0.08] overflow-hidden', className)}>
      {/* Header */}
      <div className="flex gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/[0.08] dark:bg-slate-800/50">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex gap-4 border-b border-slate-100 px-4 py-3 last:border-0 dark:border-slate-800"
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid gap-4', `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count}`, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-md border border-slate-200 bg-white p-4 dark:border-white/[0.08] dark:bg-[#22272B]"
        >
          <Skeleton className="mb-2 h-3 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="mt-2 h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Kanban column skeleton — mimics the issues page board layout */
export function SkeletonKanban({ columns = 4, cardsPerColumn = 3 }: { columns?: number; cardsPerColumn?: number }) {
  return (
    <div className="flex h-full gap-4">
      {Array.from({ length: columns }).map((_, colIdx) => (
        <div key={colIdx} className="flex w-72 flex-shrink-0 flex-col">
          {/* Column header */}
          <div className="mb-3 flex items-center gap-2 px-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-6 rounded-sm" />
          </div>
          {/* Cards */}
          <div className="flex-1 space-y-2">
            {Array.from({ length: cardsPerColumn }).map((_, cardIdx) => (
              <div
                key={cardIdx}
                className="rounded-md border border-gray-200 bg-white p-3 dark:border-slate-700 dark:bg-[#22272B]"
              >
                <Skeleton className="mb-2.5 h-4 w-full" />
                <Skeleton className="mb-2.5 h-3 w-2/3" />
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Issue slideout skeleton — two-column layout matching IssueDetailSlideout */
export function SkeletonIssueDetail() {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-3">
        <Skeleton className="h-5 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
      {/* Two-column layout */}
      <div className="flex flex-1">
        {/* Left: title + description + activity */}
        <div className="flex-1 space-y-6 p-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-7 w-28 rounded-md" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-3 pt-4">
            <Skeleton className="h-4 w-20" />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
        {/* Right: details panel */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-800 p-5 space-y-4">
          <Skeleton className="h-4 w-16" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
      {/* Stats row */}
      <SkeletonStats count={4} />
      {/* Content area */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SkeletonTable rows={6} cols={4} />
        </div>
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

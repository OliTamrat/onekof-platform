import { Skeleton, SkeletonStats, SkeletonTable } from '@/components/ui/skeleton';

export default function BudgetLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>
      <SkeletonStats count={4} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#22272B]">
          <Skeleton className="mb-4 h-5 w-32" />
          <Skeleton className="h-48 w-full rounded-md" />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#22272B]">
          <Skeleton className="mb-4 h-5 w-32" />
          <Skeleton className="h-48 w-full rounded-md" />
        </div>
      </div>
      <SkeletonTable rows={5} cols={4} />
    </div>
  );
}
